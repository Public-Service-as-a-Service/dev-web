import { Header, Link, Logo } from '@sk-web-gui/react';

export interface MenuItem {
  label: string;
  href: string;
  external?: boolean;
}

export function SiteHeader({ menu }: { menu: MenuItem[] }) {
  return (
    <Header
      wrapperClasses="sticky top-0 z-10"
      logo={
        <Link
          href="index.html"
          className="no-underline"
          aria-label="Målarkitekturen Sundsvalls kommun. Gå till startsidan."
        >
          <Logo variant="service" title="Målarkitekturen" subtitle="Sundsvalls kommun" />
        </Link>
      }
      mainMenu={
        <nav aria-label="Huvudmeny" className="flex flex-wrap items-center gap-x-24 gap-y-8 py-12">
          {menu.map((item) => (
            <Link key={item.href} href={item.href} external={item.external} variant="tertiary">
              {item.label}
            </Link>
          ))}
        </nav>
      }
    />
  );
}
