/**
 * Icon path data. Kept in a .ts module so the union type and the map live
 * outside Astro frontmatter, where a multi-line type union trips the compiler.
 *
 * Replaces the Ionicons CDN web-component bundle: the site uses a handful of
 * icons, so shipping them as inline markup removes a third-party request.
 */
export const iconPaths = {
  whatsapp:
    'M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.15c-.25.69-1.45 1.32-2 1.4-.53.08-1.19.11-1.92-.12a17.6 17.6 0 0 1-1.74-.64c-3.06-1.32-5.06-4.4-5.21-4.6-.15-.2-1.25-1.66-1.25-3.17s.79-2.25 1.07-2.56c.28-.31.61-.39.81-.39l.58.01c.19.01.44-.07.69.53.25.6.85 2.08.93 2.23.07.15.12.33.02.53-.1.2-.15.32-.3.5l-.44.52c-.15.15-.3.31-.13.61.17.3.76 1.26 1.63 2.04 1.12 1 2.07 1.31 2.37 1.46.3.15.47.12.65-.08.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.07.13.07.75-.18 1.44Z',
  mail: 'M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm2.2.25 6.3 4.72a.75.75 0 0 0 .9 0L18.7 7H5.2Zm14.3 1.62-6.1 4.57a2.25 2.25 0 0 1-2.7 0L4.5 8.62v8.63c0 .69.56 1.25 1.25 1.25h12.5c.69 0 1.25-.56 1.25-1.25V8.62Z',
  phone:
    'M6.6 3h2.2a1 1 0 0 1 .96.73l.9 3.13a1 1 0 0 1-.33 1.05l-1.5 1.2a13.5 13.5 0 0 0 6.06 6.06l1.2-1.5a1 1 0 0 1 1.05-.33l3.13.9a1 1 0 0 1 .73.96v2.2A2.6 2.6 0 0 1 18.4 20 15.4 15.4 0 0 1 4 5.6 2.6 2.6 0 0 1 6.6 3Z',
  'arrow-right': 'M4 12h15m0 0-6-6m6 6-6 6',
  'arrow-down': 'M12 4v15m0 0 6-6m-6 6-6-6',
  close: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  play: 'M8 5.5v13l11-6.5-11-6.5Z',
  'chevron-left': 'M15 5l-7 7 7 7',
  'chevron-right': 'M9 5l7 7-7 7',
  check: 'M4.5 12.5l5 5 10-11',
  clock: 'M12 7v5.2l3.2 1.9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  pin: 'M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z',
} as const;

export type IconName = keyof typeof iconPaths;

/** Glyphs drawn as filled shapes; everything else is stroked. */
export const solidIcons: readonly IconName[] = ['whatsapp', 'mail', 'phone', 'play'];
