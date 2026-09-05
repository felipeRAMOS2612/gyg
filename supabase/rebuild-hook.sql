-- Trigger a site rebuild whenever the landing's content changes.
--
-- The site is statically generated: `getServices()` and `getGeneralMedia()` run
-- at build time, so editing a row in the admin changes the database but not the
-- published HTML. These triggers close that gap by asking the host for a new
-- build as soon as the content actually changes.
--
-- The host is named nowhere below. A deploy hook is just a URL that starts a
-- build when it receives a POST, and every provider offers one, so moving
-- between them is a change of secret rather than a change of schema.
--
-- Run this file once in the Supabase SQL Editor, AFTER creating the deploy hook
-- (see supabase/README.md for the steps).

-- pg_net issues the HTTP call asynchronously, so a slow host can never block or
-- fail the admin's write.
create extension if not exists pg_net with schema extensions;

-- Drop the earlier Netlify-specific names, if this database ever ran them.
drop trigger if exists media_rebuild on public.media;
drop trigger if exists services_rebuild on public.services;
drop function if exists public.request_netlify_rebuild;

-- The deploy hook URL is a credential: anyone holding it can spend the site's
-- build allowance. It lives in Vault, never inline in a function body.
-- Replace the placeholder with the URL your host gave you, run this statement
-- alone, then clear it from the editor so it does not linger in the history.
select vault.create_secret(
  'PASTE_YOUR_DEPLOY_HOOK_URL_HERE',
  'site_deploy_hook',
  'Deploy hook that rebuilds the GyG landing'
);

create or replace function public.request_site_rebuild()
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
   where name = 'site_deploy_hook';

  -- No secret configured yet: stay silent rather than failing the admin's
  -- write. This is also how the hook is paused when the build allowance runs
  -- out — delete the secret and content edits stop asking for deploys.
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

comment on function public.request_site_rebuild is
  'Statement-level trigger function: asks the host to rebuild the landing after a content change.';

-- FOR EACH STATEMENT, not FOR EACH ROW. Reordering ten gallery images is one
-- UPDATE touching ten rows; row-level firing would queue ten redundant builds.
create trigger media_rebuild
  after insert or update or delete on public.media
  for each statement
  execute function public.request_site_rebuild();

create trigger services_rebuild
  after insert or update or delete on public.services
  for each statement
  execute function public.request_site_rebuild();
