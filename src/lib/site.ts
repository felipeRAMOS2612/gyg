/**
 * Single source of truth for company details and the copy that is not managed
 * from the admin. Keeping it here avoids the same phone number or claim
 * drifting across the header, the contact section and the footer.
 */
export const site = {
  name: 'G&G Ingeniería SPA',
  shortName: 'G&G Ingeniería',
  tagline: 'Limpieza y desinfección industrial · Mantención de tuberías',
  slogan: 'Limpieza que se nota. Calidad que se confía.',
  description:
    'G&G Ingeniería SPA. Especialistas en limpieza y desinfección industrial: limpieza de tuberías con hydrojet, lavado y desinfección de estanques, limpieza de superficies y construcciones varias.',
  phone: '+569 5441 2905',
  whatsapp: 'https://wa.me/56954412905',
  email: 'g.g.ingenieriaspa@gmail.com',
} as const;
