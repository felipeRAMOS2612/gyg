import { defineConfig } from 'astro/config';
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
  site: 'https://gyg-ingenieria.com',
  image: {
    // Required before <Image /> will process a remote source.
    remotePatterns: imageHost ? [{ protocol: 'https', hostname: imageHost }] : [],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
