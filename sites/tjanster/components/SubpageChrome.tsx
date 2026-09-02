import { SiteFooter, SiteHeader, footerLinks, sectionLinks } from '@sundsvall/chrome';
import React from 'react';

const menu = [
  ...sectionLinks('../', 'tjanster'),
  { label: 'Om katalogen', href: 'index.html#om-katalogen' },
  { label: 'Webbapplikationer', href: 'index.html#tjanster' },
];

/** Sidhuvud, sidfot och meny för undersidorna under tjanster/. */
export function SubpageChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader menu={menu} prefix="../" />
      <main>{children}</main>
      <SiteFooter links={footerLinks('../')} />
    </>
  );
}
