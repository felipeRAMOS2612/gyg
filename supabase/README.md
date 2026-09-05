# Auto-publishing content changes

The landing is statically generated. `getServices()` and `getGeneralMedia()` run
during the build, so a change made in the admin updates the database but not the
published page — nothing tells Netlify there is new content to render.

`rebuild-hook.sql` closes that gap: a change in `public.media` or
`public.services` asks Netlify for a fresh build. A published change goes live
one to two minutes later.

## 1. Create the build hook in Netlify

1. Open the site in Netlify.
2. **Site configuration → Build & deploy → Build hooks**.
3. **Add build hook**.
   - Name: `Supabase content change`
   - Branch to build: `main`
4. **Save**, then copy the generated URL. It looks like
   `https://api.netlify.com/build_hooks/<id>`.

Treat that URL as a password. Anyone who has it can trigger builds on the site.

## 2. Install the trigger in Supabase

1. Open the project in Supabase → **SQL Editor**.
2. Paste the contents of `rebuild-hook.sql`.
3. Replace `PASTE_YOUR_NETLIFY_BUILD_HOOK_URL_HERE` with the URL from step 1.
4. Run the file.

The URL is stored in Supabase Vault, not inline in the function, so it never
shows up in a schema dump.

## 3. Verify it works

Change the `description` of any row in `public.media`, then watch **Deploys** in
Netlify. A new build should appear within a few seconds.

To inspect the calls the database made:

```sql
select id, created, url, status_code
  from net._http_response
 order by created desc
 limit 10;
```

A `status_code` of 200 means Netlify accepted the request.

## Notes

- The triggers fire **per statement**, not per row. Reordering ten images is one
  `UPDATE` over ten rows and produces one build, not ten.
- `pg_net` sends the request asynchronously. If Netlify is slow or unreachable,
  the admin's save still succeeds — it is never blocked by the deploy.
- Editing rows in quick succession queues several builds. Netlify runs them in
  order and the last one wins, so the published result is still correct.

## Rolling it back

```sql
drop trigger if exists media_rebuild on public.media;
drop trigger if exists services_rebuild on public.services;
drop function if exists public.request_netlify_rebuild;
select vault.delete_secret('netlify_build_hook');
```
