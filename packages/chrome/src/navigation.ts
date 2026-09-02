// Webbplatsens gemensamma navigation. Sektionerna beskriver bara sina egna
// ankarlänkar – tvärlänkarna mellan sektionerna kommer härifrån, så att menyn
// och sidfoten ser likadana ut överallt.

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  /** Sätts på den sektion besökaren befinner sig i. */
  current?: boolean;
}

// Namnet i sidhuvudets logotyp. Samma på alla sidor: sektionerna är delar av
// en webbplats, inte egna webbplatser.
export const SITE_NAME = 'Utveckling';

// `prefix` är den relativa sökvägen till webbplatsens rot: './' på startsidan,
// '../' för en sida inne i en sektion. Relativa länkar gör att bygget fungerar
// både i containern (på rot) och på GitHub Pages (i en underkatalog).
//
export type Section = 'arkitektur' | 'tjanster' | 'api';

export function sectionLinks(prefix = './', current?: Section): NavLink[] {
  return [
    {
      label: 'Målarkitekturen',
      href: `${prefix}arkitektur/index.html`,
      current: current === 'arkitektur',
    },
    {
      label: 'Webbkatalogen',
      href: `${prefix}tjanster/index.html`,
      current: current === 'tjanster',
    },
    {
      label: 'API-katalogen',
      href: `${prefix}api/index.html`,
      current: current === 'api',
    },
  ];
}

export function footerLinks(prefix = './'): NavLink[] {
  return [
    ...sectionLinks(prefix),
    {
      label: 'Sundsvalls kommun på GitHub',
      href: 'https://github.com/Sundsvallskommun',
      external: true,
    },
    { label: 'Kommuna', href: 'https://kommuna.se/index.html', external: true },
    { label: 'Eneo', href: 'https://eneo.ai/', external: true },
    { label: 'sundsvall.se', href: 'https://sundsvall.se', external: true },
  ];
}
