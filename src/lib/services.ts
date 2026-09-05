import { supabase } from './supabase';
import { MEDIA_COLUMNS, toAssets, type MediaAsset, type MediaRow } from './media';

export interface ServiceMedia extends MediaAsset {
  /**
   * Whether the object answered a HEAD request during the build. Only reachable
   * images go through <Image />; an unreachable one would abort the whole build
   * when Astro tried to download it for optimisation. Always false for videos,
   * which astro:assets does not process.
   */
  optimizable: boolean;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  media: ServiceMedia[];
  /**
   * Card cover. The card renders a static image, so the cover is the first
   * *image* in author order; a service holding only videos has none and falls
   * back to its number.
   */
  cover: ServiceMedia | null;
}

interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  media: MediaRow[] | null;
}

/** Probe an object once, with a short timeout so a hung host cannot stall a build. */
async function isReachable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch published services with their media at build time.
 *
 * Reads `public.media` directly through the services embed. The old
 * `service_images` view is frozen and can never return a video, so it is not
 * used here. A service gallery may now contain both kinds; `kind` is carried
 * through and the components branch on it.
 *
 * Nested rows arrive unordered from PostgREST, so they are sorted by `position`
 * here. Assets whose R2 URL cannot be resolved are dropped instead of
 * rendering as broken.
 *
 * Never throws: a failed query logs a clear warning and returns an empty list
 * so the section renders its fallback and the rest of the page still builds.
 */
export async function getServices(): Promise<Service[]> {
  if (!supabase) {
    console.warn(
      '[services] Supabase is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in .env. Rendering an empty services section.',
    );
    return [];
  }

  const { data, error } = await supabase
    .from('services')
    .select(`id, slug, name, description, media(${MEDIA_COLUMNS})`)
    .eq('is_published', true)
    .order('position');

  if (error) {
    console.warn(
      `[services] Supabase query failed: ${error.message}. Rendering an empty services section.`,
    );
    return [];
  }

  const rows = (data ?? []) as unknown as ServiceRow[];

  // Resolve every URL first, then probe each distinct image exactly once.
  const resolved = rows.map((row) => ({ row, media: toAssets(row.media) }));

  const urls = [
    ...new Set(
      resolved.flatMap((entry) =>
        entry.media.filter((asset) => asset.kind === 'image').map((asset) => asset.url),
      ),
    ),
  ];
  const reachability = new Map(
    await Promise.all(urls.map(async (url) => [url, await isReachable(url)] as const)),
  );

  const unreachable = urls.filter((url) => !reachability.get(url));
  if (unreachable.length > 0) {
    console.warn(
      `[services] ${unreachable.length} of ${urls.length} image(s) did not respond. They will be served unoptimised straight from the bucket.`,
    );
  }

  return resolved.map(({ row, media }) => {
    const withFlags: ServiceMedia[] = media.map((asset) => ({
      ...asset,
      optimizable: asset.kind === 'image' && (reachability.get(asset.url) ?? false),
    }));

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      media: withFlags,
      cover: withFlags.find((asset) => asset.kind === 'image') ?? null,
    };
  });
}
