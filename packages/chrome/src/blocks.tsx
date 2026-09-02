import { Button, Card, Label, Link } from '@sk-web-gui/react';
import React from 'react';

// Button är polymorf (as="a") men den exporterade typen tappar ankar-attributen.
export const ButtonLink = Button as unknown as React.FC<
  {
    as: 'a';
    variant?: 'link' | 'primary' | 'secondary' | 'tertiary' | 'ghost';
    color?: 'vattjom' | 'gronsta' | 'bjornstigen' | 'juniskar' | 'primary';
    size?: 'sm' | 'md' | 'lg';
    children?: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>
>;

export function PageSection({
  id,
  alt,
  children,
}: {
  id?: string;
  alt?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={alt ? 'bg-background-200' : 'bg-background-content'}>
      <div className="mx-auto w-full max-w-content px-16 py-40 md:px-24 md:py-48">{children}</div>
    </section>
  );
}

export function Hero({
  kicker,
  title,
  lead,
  actions,
  back,
}: {
  kicker: string;
  title: string;
  lead: React.ReactNode;
  actions?: React.ReactNode;
  back?: { label: string; href: string };
}) {
  return (
    <section className="bg-vattjom-background-200">
      <div className="mx-auto w-full max-w-content px-16 py-48 md:px-24 md:py-64">
        {back && (
          <p className="m-0 mb-16">
            <Link href={back.href} variant="tertiary">
              ← {back.label}
            </Link>
          </p>
        )}
        <p className="text-label-medium uppercase text-vattjom-text-primary m-0">{kicker}</p>
        <h1 className="font-header mt-8">{title}</h1>
        <p className="text-lead m-0">{lead}</p>
        {actions && <div className="mt-32 flex flex-wrap gap-16">{actions}</div>}
      </div>
    </section>
  );
}

export function TeaserCard({
  tag,
  tagColor = 'vattjom',
  title,
  href,
  more,
  color = 'mono',
  children,
}: {
  tag: string;
  tagColor?: string;
  title: string;
  href?: string;
  more?: string;
  color?: 'mono' | 'vattjom';
  children: React.ReactNode;
}) {
  const body = (
    <Card.Body>
      <div className="pt-8">
        <Label inverted color={tagColor}>
          {tag}
        </Label>
      </div>
      <h3 className="font-header text-h4-sm md:text-h4-md xl:text-h4-lg text-dark-primary mt-12 mb-0">
        {title}
      </h3>
      <p className="mt-8 mb-0 text-dark-primary">{children}</p>
      {more && <p className="mt-12 mb-0 font-bold text-vattjom-text-primary">{more} →</p>}
    </Card.Body>
  );
  const invert = color !== 'mono';
  return href ? (
    <Card color={color} invert={invert} useHoverEffect href={href}>
      {body}
    </Card>
  ) : (
    <Card color={color} invert={invert}>
      {body}
    </Card>
  );
}

export function FactBox({
  title,
  items,
  links,
}: {
  title: string;
  items: React.ReactNode[];
  links?: { label: string; href: string }[];
}) {
  return (
    <Card color="vattjom" invert aria-label={title} role="complementary">
      <Card.Body>
        <h3 className="font-header text-h4-sm md:text-h4-md xl:text-h4-lg mt-8 mb-0">{title}</h3>
        <ul className="mt-12 mb-0 flex list-disc flex-col gap-8 pl-20">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        {links && (
          <p className="mt-16 mb-0 flex flex-col gap-4">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="font-bold text-vattjom-text-primary">
                {link.label} →
              </a>
            ))}
          </p>
        )}
      </Card.Body>
    </Card>
  );
}

export function DiagramFigure({
  src,
  alt,
  scrollable,
  children,
}: {
  src: string;
  alt: string;
  scrollable?: boolean;
  children: React.ReactNode;
}) {
  return (
    <figure className="my-32 mx-0">
      <div className="overflow-x-auto rounded-cards border-1 border-divider bg-background-content p-16 md:p-24">
        <img
          src={src}
          alt={alt}
          className={scrollable ? 'w-[2760px] max-w-none' : 'h-auto w-full'}
        />
      </div>
      <figcaption className="mt-12 text-small text-dark-secondary">{children}</figcaption>
    </figure>
  );
}

export function TwoColumns({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-32 lg:grid-cols-3">
      <div className="lg:col-span-2">{children}</div>
      <div>{aside}</div>
    </div>
  );
}
