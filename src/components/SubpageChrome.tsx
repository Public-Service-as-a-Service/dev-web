import React from 'react';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

const menu = [
  { label: 'Om katalogen', href: '../index.html#om-katalogen' },
  { label: 'Webbapplikationer', href: '../index.html#tjanster' },
  { label: 'GitHub', href: 'https://github.com/Sundsvallskommun', external: true },
];

const footerLinks = [
  {
    label: 'Sundsvalls kommun på GitHub',
    href: 'https://github.com/Sundsvallskommun',
    external: true,
  },
  { label: 'sundsvall.se', href: 'https://sundsvall.se', external: true },
];

/** Sidhuvud, sidfot och meny för undersidorna under tjanster/. */
export function SubpageChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader menu={menu} homeHref="../index.html" />
      <main>{children}</main>
      <SiteFooter
        title="Webbkatalogen"
        description="En översikt över de webbapplikationer som Sundsvalls kommun delar som öppen källkod."
        links={footerLinks}
      />
    </>
  );
}
