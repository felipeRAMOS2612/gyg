import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

// The bucket host is read from IMAGE_BASE_URL rather than hardcoded, so moving
// the bucket to another domain stays a one-line .env change.
const { IMAGE_BASE_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

let imageHost;
try {
  imageHost = IMAGE_BASE_URL ? new URL(IMAGE_BASE_URL).hostname : undefined;
} catch {
  imageHost = undefined;
}

// https://astro.build/config
export default defineConfig({
  site: 'https://gyg-ingenieria.cl',

  /*
   * Declared here on purpose, even though every route is prerendered and a
   * static build needs no adapter.
   *
   * Cloudflare Pages injects `@astrojs/cloudflare` on its own when it detects
   * an Astro project, and the injected default is `imageService:
   * 'cloudflare-binding'` — images are transformed at runtime through the
   * Cloudflare Images binding. That binding is not enabled on this project, so
   * every <Image /> pointed at `/_image?href=...` and got a 404.
   *
   * `'compile'` restores build-time transformation for prerendered routes: the
   * optimised files are emitted into _astro/ during the build, exactly as they
   * are locally. Declaring the adapter also means the build no longer depends
   * on whatever default the platform decides to inject next.
   */
  adapter: cloudflare({ imageService: 'compile' }),

  image: {
    // Required before <Image /> will process a remote source.
    remotePatterns: imageHost ? [{ protocol: 'https', hostname: imageHost }] : [],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
