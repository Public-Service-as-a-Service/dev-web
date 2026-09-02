import { Card, Label } from '@sk-web-gui/react';
import React from 'react';

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
}: {
  kicker: string;
  title: string;
  lead: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="bg-vattjom-background-200">
      <div className="mx-auto w-full max-w-content px-16 py-48 md:px-24 md:py-64">
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
