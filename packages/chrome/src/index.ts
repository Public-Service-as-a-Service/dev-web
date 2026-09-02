// Allt som utgör webbplatsens gemensamma utseende exporteras härifrån.
// Sektionerna (start, arkitektur, katalogerna) importerar bara från
// "@sundsvall/chrome" – aldrig från varandra.
export { AppShell } from './AppShell';
export { SiteHeader } from './SiteHeader';
export { SiteFooter, SiteFooterContact } from './SiteFooter';
export type { MenuItem } from './SiteHeader';
export type { FooterLink } from './SiteFooter';
export {
  ButtonLink,
  DiagramFigure,
  FactBox,
  Hero,
  PageSection,
  TeaserCard,
  TwoColumns,
} from './blocks';
export { SITE_NAME, footerLinks, sectionLinks } from './navigation';
export type { NavLink, Section } from './navigation';
