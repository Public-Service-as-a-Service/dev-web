import { Footer, Link } from '@sk-web-gui/react';
import React from 'react';
import { SITE_NAME } from './navigation';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface SiteFooterProps {
  title?: string;
  description?: React.ReactNode;
  links: FooterLink[];
}

// Avsändaren är densamma för hela webbplatsen och skrivs därför på ett ställe.
export function SiteFooterContact() {
  return (
    <>
      Digitalisering och Innovation, Sundsvalls kommun
      <br />
      Norrmalmsgatan 4, 851 85 Sundsvall
      <br />
      E-post:{' '}
      <Link href="mailto:diggin@sundsvall.se" className="break-all">
        diggin@sundsvall.se
      </Link>
    </>
  );
}

export function SiteFooter({
  title = SITE_NAME,
  description = <SiteFooterContact />,
  links,
}: SiteFooterProps) {
  return (
    <Footer className="border-t border-divider bg-background-200">
      <Footer.Content>
        <div className="grid w-full gap-32 md:grid-cols-2">
          <div>
            <p className="font-header font-bold text-large mb-8 text-dark-primary">{title}</p>
            <p>{description}</p>
          </div>
          <div>
            <p className="font-header font-bold text-large mb-8 text-dark-primary">Länkar</p>
            <Footer.List>
              {links.map((link) => (
                <Footer.ListItem key={link.href}>
                  <Link href={link.href} external={link.external}>
                    {link.label}
                  </Link>
                </Footer.ListItem>
              ))}
            </Footer.List>
          </div>
        </div>
      </Footer.Content>
    </Footer>
  );
}
