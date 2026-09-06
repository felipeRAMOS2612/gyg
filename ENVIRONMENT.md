# Environment variables

Three, and no more. They are read at **build time**, so changing one in the host
only takes effect on the next deploy — a running site never picks up a new value
on its own.

None of them carries a `VITE_` prefix. That prefix belongs to the admin, which
is a Vite app and needs its configuration inside the browser bundle. This
landing is Astro and reads these on the server while building, so the plain
names are the correct ones. Copying the admin's names here is the most likely
way to get a green build with no content.

| Variable | Read by | Value |
| --- | --- | --- |
| `SUPABASE_URL` | `src/lib/supabase.ts` | Project URL — Supabase Dashboard → Project Settings → API |
| `SUPABASE_PUBLISHABLE_KEY` | `src/lib/supabase.ts` | The publishable (anon) key from the same page |
| `IMAGE_BASE_URL` | `src/lib/media.ts`, `astro.config.mjs` | `https://pub-13db5c9d28ef44f5ba6bf5bcfc814973.r2.dev` |

`IMAGE_BASE_URL` takes no trailing slash. `media.path` stores only the R2 object
key, so this is what turns a key into a URL; without it every asset resolves to
`null` and the galleries render empty.

## Where to set them

- **Locally:** a `.env` file at the repository root.
- **Cloudflare Pages:** Settings → Environment variables → Production. Add them
  before the first build, then redeploy.

## When something is missing

Nothing fails. `supabase.ts` returns a null client and `media.ts` resolves every
URL to null, so the build stays green and the page renders without the content
it could not reach. That is deliberate — a landing with an empty section still
publishes — but it means a forgotten variable looks like a visual bug rather
than an error.

The two failure modes are worth telling apart, because they look identical from
the browser:

- **Service names missing too** → Supabase is not configured. Check
  `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
- **Service names present, no images** → Supabase is fine and `IMAGE_BASE_URL`
  is missing.

The build log says which: `[services] Supabase is not configured` and
`[media] Supabase is not configured` are printed while static routes generate.
