# Auto-publishing content changes

The landing is statically generated. `getServices()` and `getGeneralMedia()` run
during the build, so a change made in the admin updates the database but not the
published page — nothing tells the host there is new content to render.

`rebuild-hook.sql` closes that gap: a change in `public.media` or
`public.services` asks for a fresh build. A published change goes live one to
two minutes later.

The SQL never names a host. A deploy hook is a URL that starts a build when it
receives a POST, so switching providers means replacing one secret.

## 1. Create the deploy hook

**Cloudflare Pages** — the current host:

1. Open the project → **Settings → Builds & deployments → Deploy hooks**.
2. **Add deploy hook**. Name: `Supabase content change`. Branch: `main`.
3. Copy the generated URL.

**Netlify**, if the site ever moves back: **Site configuration → Build & deploy
→ Build hooks → Add build hook**, same two fields.

Treat that URL as a password. Anyone who has it can spend the site's build
allowance.

## 2. Install the trigger in Supabase

1. Open the project in Supabase → **SQL Editor**.
2. Paste the contents of `rebuild-hook.sql`.
3. Replace `PASTE_YOUR_DEPLOY_HOOK_URL_HERE` with the URL from step 1.
4. Run the file.

The URL is stored in Supabase Vault, not inline in the function, so it never
shows up in a schema dump.

## 3. Verify it works

Change the `description` of any row in `public.media`, then watch the host's
deployments. A new build should appear within a few seconds.

To inspect the calls the database made:

```sql
select id, created, url, status_code
  from net._http_response
 order by created desc
 limit 10;
```

A `status_code` of 200 means the hook was accepted.

## Pausing it

If the build allowance runs low, delete the secret. The trigger stays in place
and returns without calling anything, so content edits keep working and simply
stop asking for deploys.

```sql
select vault.delete_secret('site_deploy_hook');
```

Restore it later by running the `vault.create_secret` statement again.

## Notes

- The triggers fire **per statement**, not per row. Reordering ten images is one
  `UPDATE` over ten rows and produces one build, not ten.
- `pg_net` sends the request asynchronously. If the host is slow or unreachable,
  the admin's save still succeeds — it is never blocked by the deploy.
- Editing rows in quick succession queues several builds. Hosts run them in
  order and the last one wins, so the published result is still correct.

## Rolling it back

```sql
drop trigger if exists media_rebuild on public.media;
drop trigger if exists services_rebuild on public.services;
drop function if exists public.request_site_rebuild;
select vault.delete_secret('site_deploy_hook');
```
