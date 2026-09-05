/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Supabase project URL. Server-side only. */
  readonly SUPABASE_URL: string;
  /** Supabase publishable (anon) key. Read-only access. Server-side only. */
  readonly SUPABASE_PUBLISHABLE_KEY: string;
  /** Public base URL of the Cloudflare R2 bucket, without a trailing slash. */
  readonly IMAGE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
