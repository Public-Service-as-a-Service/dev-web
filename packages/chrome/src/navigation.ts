// Webbplatsens gemensamma navigation. Sektionerna beskriver bara sina egna
// ankarlänkar – tvärlänkarna mellan sektionerna kommer härifrån, så att menyn
// och sidfoten ser likadana ut överallt.

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

// Namnet i sidhuvudets logotyp. Samma på alla sidor: sektionerna är delar av
// en webbplats, inte egna webbplatser.
export const SITE_NAME = 'Utveckling';

// `prefix` är den relativa sökvägen till webbplatsens rot: './' på startsidan,
// '../' för en sida inne i en sektion. Relativa länkar gör att bygget fungerar
// både i containern (på rot) och på GitHub Pages (i en underkatalog).
//
// Webb- och API-katalogen ligger ännu på egna domäner och är därför externa.
// När de flyttas in blir de `${prefix}tjanster/index.html` respektive
// `${prefix}api/index.html`.
export function sectionLinks(prefix = './'): NavLink[] {
  return [
    { label: 'Målarkitekturen', href: `${prefix}arkitektur/index.html` },
    {
      label: 'Webbkatalogen',
      href: 'https://web-katalog.sundsvall.dev/index.html',
      external: true,
    },
    {
      label: 'API-katalogen',
      href: 'https://api-katalog.sundsvall.dev/index.html',
      external: true,
    },
  ];
}

export function footerLinks(prefix = './'): NavLink[] {
  return [
    ...sectionLinks(prefix),
    { label: 'Kommuna', href: 'https://kommuna.se/index.html', external: true },
    { label: 'Eneo', href: 'https://eneo.ai/', external: true },
    { label: 'sundsvall.se', href: 'https://sundsvall.se', external: true },
  ];
}
