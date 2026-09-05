# G&G Ingeniería — Landing

Static marketing site for G&G Ingeniería SPA. Built with Astro and Tailwind CSS.
Services and their photos are pulled from Supabase **at build time**, so the
published site is plain HTML with no client-side data fetching.

## Requirements

- Node.js 20 or newer

## Setup

```bash
npm install
# create .env with the variables listed below
npm run dev            # http://localhost:4321
```

### Environment variables

Create a `.env` file in the project root. None of these use the `PUBLIC_`
prefix, which keeps them server-side only — they are read in Astro frontmatter
during the build and never reach the browser.

| Variable                   | Description                                                        |
| -------------------------- | ------------------------------------------------------------------ |
| `SUPABASE_URL`             | Supabase project URL.                                              |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key. Read-only.                        |
| `IMAGE_BASE_URL`           | Public domain of the Cloudflare R2 bucket, **without** a trailing slash. |

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
IMAGE_BASE_URL=https://images.example.com
```

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Dev server on `localhost:4321`.      |
| `npm run build`   | Static build into `dist/`.           |
| `npm run preview` | Serve the production build locally.  |

## How content works

Services are managed from a separate admin. This site **only reads** them.

- `src/lib/supabase.ts` — the Supabase client, created once and reused. Returns
  `null` when the environment is not configured.
- `src/lib/services.ts` — `getServices()` fetches published services with their
  media, sorts each gallery by `position`, and resolves R2 URLs. It never
  throws: on error it logs a warning and returns `[]`, so the services section
  falls back to a CTA instead of breaking the build.
- `src/lib/media.ts` — the single read path into `public.media`.
  `getGeneralMedia()` returns the landing's general assets (`service_id IS NULL`)
  for the "Nuestro trabajo" section, and `mediaUrl(path)` joins `IMAGE_BASE_URL`
  with the object key stored in `media.path`. Keys are relative on purpose so
  the bucket domain can change without touching the database.
- `src/lib/site.ts` — phone, email, hours and the hero figures. Edit contact
  details and headline stats here; nothing else hardcodes them.

### Schema (read-only)

```
services  id, slug, name, description, position, is_published, created_at, updated_at
media     id, service_id -> services.id (NULL = general), kind ('image'|'video'),
          path, alt, description, position, created_at
```

Two rules carry the meaning of `media`:

- `service_id IS NULL` means the asset is **general**: it belongs to the landing
  as a whole, not to a service. There is no boolean flag.
- `kind` distinguishes image from video. Never infer it from the file extension.

`alt` is accessibility text; `description` is the visible caption. They are not
interchangeable, and both are nullable.

Anonymous access can read all general media plus the media of published
services; RLS handles that filter, so no `is_published` check is needed on media
rows. Every write requires an authenticated user; this site never writes.

The `service_images` view is a frozen backward-compatibility shim over
`media WHERE kind = 'image' AND service_id IS NOT NULL`. Nothing here reads it.

### Adding a service

Publish it from the admin, then redeploy. Content is baked in at build time, so
a rebuild is what makes new services appear.

## Design system

Tokens live in `src/styles/global.css` under `@theme` (Tailwind v4 is
CSS-first — there is no `tailwind.config.js`). The palette keeps the original
brand colours: deep navy `#0a263b` (`ink-900`), steel `#3b566e` (`steel-500`)
and coral `#f65757` (`accent-500`).

## Images

`<img loading="lazy">` is used directly for remote R2 images. If you switch to
`<Image />` from `astro:assets`, declare the bucket host in
`image.remotePatterns` inside `astro.config.mjs` first.
