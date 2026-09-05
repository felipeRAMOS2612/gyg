-- Trigger a Netlify rebuild whenever the landing's content changes.
--
-- The site is statically generated: `getServices()` and `getGeneralMedia()` run
-- at build time, so editing a row in the admin changes the database but not the
-- published HTML. These triggers close that gap by asking Netlify for a new
-- build as soon as the content actually changes.
--
-- Run this file once in the Supabase SQL Editor, AFTER creating the build hook
-- in Netlify (see supabase/README.md for the steps).

-- pg_net issues the HTTP call asynchronously, so a slow Netlify response can
-- never block or fail the admin's write.
create extension if not exists pg_net with schema extensions;

-- The build hook URL is a credential: anyone holding it can spend the site's
-- build minutes. It lives in Vault, never inline in a function body.
-- Replace the placeholder with the URL Netlify gave you, run this line alone,
-- then delete it from your editor so it does not linger in the query history.
select vault.create_secret(
  'PASTE_YOUR_NETLIFY_BUILD_HOOK_URL_HERE',
  'netlify_build_hook',
  'Netlify build hook that redeploys the GyG landing'
);

create or replace function public.request_netlify_rebuild()
returns trigger
language plpgsql
security definer
-- Vault lives outside the default path; naming the schemas here keeps the
-- function from resolving objects through a caller-controlled search_path.
set search_path = public, vault, extensions
as $$
declare
  hook_url text;
begin
  select decrypted_secret
    into hook_url
    from vault.decrypted_secrets
   where name = 'netlify_build_hook';

  -- No secret configured yet: stay silent rather than failing the admin's write.
  if hook_url is null then
    return null;
  end if;

  perform net.http_post(
    url := hook_url,
    body := jsonb_build_object(
      'trigger_table', tg_table_name,
      'trigger_op', tg_op,
      'requested_at', now()
    )
  );

  return null;
end;
$$;

comment on function public.request_netlify_rebuild is
  'Statement-level trigger function: asks Netlify to rebuild the landing after a content change.';

-- FOR EACH STATEMENT, not FOR EACH ROW. Reordering ten gallery images is one
-- UPDATE touching ten rows; row-level firing would queue ten redundant builds.
drop trigger if exists media_rebuild on public.media;
create trigger media_rebuild
  after insert or update or delete on public.media
  for each statement
  execute function public.request_netlify_rebuild();

drop trigger if exists services_rebuild on public.services;
create trigger services_rebuild
  after insert or update or delete on public.services
  for each statement
  execute function public.request_netlify_rebuild();
