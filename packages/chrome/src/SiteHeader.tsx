import { Header, Link, Logo } from '@sk-web-gui/react';
import { SITE_NAME } from './navigation';

export interface MenuItem {
  label: string;
  href: string;
  external?: boolean;
  /** Sätts på den sektion besökaren befinner sig i. */
  current?: boolean;
}

export function SiteHeader({
  menu,
  homeHref = './index.html',
}: {
  menu: MenuItem[];
  /** Relativ sökväg till webbplatsens startsida. */
  homeHref?: string;
}) {
  return (
    <Header
      logo={
        <Link
          href={homeHref}
          className="no-underline"
          aria-label={`${SITE_NAME} Sundsvalls kommun. Gå till startsidan.`}
        >
          <Logo variant="service" title={SITE_NAME} subtitle="Sundsvalls kommun" />
        </Link>
      }
      mainMenu={
        <nav aria-label="Huvudmeny" className="flex flex-wrap items-center gap-x-24 gap-y-8 py-12">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              external={item.external}
              variant="tertiary"
              aria-current={item.current ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      }
    />
  );
}
