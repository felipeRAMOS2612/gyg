import { supabase } from './supabase';

const base = (import.meta.env.IMAGE_BASE_URL ?? '').replace(/\/+$/, '');

/**
 * Read from the column. A `.mov` extension says nothing reliable about how the
 * admin classified the asset, and the check constraint on `media.kind` is the
 * only source of truth the landing should trust.
 */
export type MediaKind = 'image' | 'video';

/** A row of `public.media` exactly as PostgREST returns it. */
export interface MediaRow {
  id: string;
  kind: MediaKind;
  path: string;
  /** Accessibility text. Never rendered as a visible caption. */
  alt: string | null;
  /** Visitor-facing caption. Never used as accessibility text. */
  description: string | null;
  position: number | null;
  created_at: string | null;
}

/** A media row whose R2 key has already been resolved into a public URL. */
export interface MediaAsset extends MediaRow {
  url: string;
}

/** Single definition of the projection, so every read stays in sync. */
export const MEDIA_COLUMNS = 'id, kind, path, alt, description, position, created_at';

/**
 * Resolve a Cloudflare R2 object key into a public URL.
 *
 * `media.path` stores only the key (e.g. "general/uuid.mp4"), so the host stays
 * configurable and the database never has to be rewritten when the bucket
 * domain changes. Absolute values pass through untouched.
 *
 * Returns null when the base URL is missing or the key is empty; callers skip
 * rendering rather than emitting a broken element.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!base) return null;
  return `${base}/${path.replace(/^\/+/, '')}`;
}

/**
 * Author-defined order. `position` is manual and may repeat or be null, so
 * `created_at` breaks ties and keeps the output stable between builds.
 */
export const byPosition = (a: MediaRow, b: MediaRow) => {
  const delta =
    (a.position ?? Number.MAX_SAFE_INTEGER) - (b.position ?? Number.MAX_SAFE_INTEGER);
  if (delta !== 0) return delta;
  return (a.created_at ?? '').localeCompare(b.created_at ?? '');
};

/** Sort by the author's order and drop rows whose URL cannot be resolved. */
export function toAssets(rows: MediaRow[] | null | undefined): MediaAsset[] {
  return (rows ?? [])
    .slice()
    .sort(byPosition)
    .flatMap((row) => {
      const url = mediaUrl(row.path);
      return url ? [{ ...row, url }] : [];
    });
}

/**
 * There is no poster column in `media`. `preload="metadata"` alone paints a
 * black rectangle, so a media fragment tells the browser to seek and decode a
 * real frame instead.
 */
export function videoFrameUrl(url: string): string {
  return url.includes('#') ? url : `${url}#t=0.1`;
}

/**
 * Fetch the landing's general media at build time.
 *
 * A null `service_id` *is* the encoding of general scope, so the filter is
 * `is('service_id', null)` — there is no boolean flag. RLS already hides media
 * of unpublished services, so no `is_published` filter is needed here.
 *
 * Never throws: a failed query logs a warning and returns an empty list so the
 * caller renders its fallback and the rest of the page still builds.
 */
export async function getGeneralMedia(kind?: MediaKind): Promise<MediaAsset[]> {
  if (!supabase) {
    console.warn(
      '[media] Supabase is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in .env. Rendering the general media fallback.',
    );
    return [];
  }

  let query = supabase.from('media').select(MEDIA_COLUMNS).is('service_id', null);
  if (kind) query = query.eq('kind', kind);

  const { data, error } = await query.order('position').order('created_at');

  if (error) {
    console.warn(
      `[media] Supabase query failed: ${error.message}. Rendering the general media fallback.`,
    );
    return [];
  }

  return toAssets(data as MediaRow[] | null);
}
