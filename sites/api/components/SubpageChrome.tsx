import { SiteFooter, SiteHeader, footerLinks, sectionLinks } from '@sundsvall/chrome';
import React from 'react';

const menu = [
  ...sectionLinks('../', 'api'),
  { label: 'Om katalogen', href: 'index.html#om-katalogen' },
  { label: 'API:er', href: 'index.html#apier' },
];

/** Sidhuvud, sidfot och meny för undersidorna under api/. */
export function SubpageChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader menu={menu} prefix="../" />
      <main>{children}</main>
      <SiteFooter links={footerLinks('../')} />
    </>
  );
}
