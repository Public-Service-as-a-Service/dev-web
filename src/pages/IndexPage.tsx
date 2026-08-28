import { Card, Label } from '@sk-web-gui/react';
import appsData from '../../scripts/apps-data.json';
import { ButtonLink, FactBox, Hero, NoteBox, PageSection, TwoColumns } from '../components/blocks';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { type AppData, STATUS_LABEL } from '../types';

const apps = appsData as AppData[];

const CATEGORY_ORDER = [
  'Ärendehantering',
  'Myndighetsutövning',
  'Invånartjänster',
  'Företagstjänster',
  'Medarbetartjänster',
  'Utbildning',
  'AI-tjänster',
  'Administration',
  'Utvecklingsverktyg',
];

interface CardData {
  namn: string;
  href: string;
  text: string;
  kategori: string;
  status?: string;
}

// De tre handskrivna lösningssidorna har inga poster i apps-data.json.
const HAND_CARDS: CardData[] = [
  {
    kategori: 'Ärendehantering',
    namn: 'Generisk ärendehantering',
    href: 'tjanster/generisk-arendehantering.html',
    text: 'En konfigurerbar tjänst för att ta emot, handlägga och avsluta ärenden och förfrågningar. Används av ett flertal verksamheter – från kontaktcenter till löne- och rekryteringsfunktioner.',
  },
  {
    kategori: 'Myndighetsutövning',
    namn: 'Myndighetsutövning – mark och exploatering',
    href: 'tjanster/myndighetsutovning-mark-och-exploatering.html',
    text: 'Stöd för handläggning av mark- och exploateringsärenden: arrenden, markförsäljning, avtal och fakturering – med koppling till fastighetsinformation.',
  },
  {
    kategori: 'Myndighetsutövning',
    namn: 'Myndighetsutövning – parkeringstillstånd',
    href: 'tjanster/myndighetsutovning-parkeringstillstand.html',
    text: 'Digital handläggning av parkeringstillstånd för rörelsehindrade – från ansökan och utredning till beslut och utfärdat tillstånd.',
  },
];

const menu = [
  { label: 'Om katalogen', href: '#om-katalogen' },
  { label: 'Webbapplikationer', href: '#tjanster' },
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

function AppCard({ card }: { card: CardData }) {
  return (
    <Card color="mono" useHoverEffect href={card.href}>
      <Card.Body>
        <div className="flex flex-wrap gap-8 pt-8">
          <Label inverted color="vattjom">
            {card.kategori}
          </Label>
          {card.status && <Label inverted>{card.status}</Label>}
        </div>
        <h3 className="font-header text-h4-sm md:text-h4-md xl:text-h4-lg text-dark-primary mt-12 mb-0">
          {card.namn}
        </h3>
        <p className="mt-8 mb-0">{card.text}</p>
        <p className="mt-12 mb-0 font-bold text-vattjom-text-primary">Läs mer om {card.namn} →</p>
      </Card.Body>
    </Card>
  );
}

export function IndexPage() {
  const byCategory = new Map<string, CardData[]>();
  for (const card of HAND_CARDS) {
    byCategory.set(card.kategori, [...(byCategory.get(card.kategori) ?? []), card]);
  }
  for (const app of apps) {
    const card: CardData = {
      kategori: app.kategori,
      namn: app.namn,
      href: `tjanster/${app.slug}.html`,
      text: app.ingress ?? '',
      status: app.status ? STATUS_LABEL[app.status] : undefined,
    };
    byCategory.set(app.kategori, [...(byCategory.get(app.kategori) ?? []), card]);
  }

  return (
    <>
      <SiteHeader menu={menu} homeHref="index.html" />
      <main>
        <Hero
          kicker="Öppen källkod från Sundsvalls kommun"
          title="En katalog över kommunens öppna webbapplikationer"
          lead="Sundsvalls kommun utvecklar digitala tjänster för invånare, företag och medarbetare – och delar dem öppet med omvärlden. Här hittar du en samlad översikt över de webbapplikationer som kommunen publicerar som öppen källkod."
          actions={
            <>
              <ButtonLink as="a" href="#tjanster" variant="primary" color="vattjom">
                Utforska applikationerna
              </ButtonLink>
              <ButtonLink
                as="a"
                href="https://github.com/Sundsvallskommun"
                variant="secondary"
                color="vattjom"
              >
                Besök Sundsvalls kommun på GitHub
              </ButtonLink>
            </>
          }
        />

        <PageSection id="om-katalogen">
          <h2 className="font-header">Vad innehåller katalogen?</h2>
          <TwoColumns
            aside={
              <FactBox
                title="Snabbfakta"
                items={[
                  <>
                    <strong>Ett 40-tal</strong> öppna webbapplikationer
                  </>,
                  <>
                    Tjänster för <strong>invånare, företag och medarbetare</strong>
                  </>,
                  <>
                    Publiceras öppet på <strong>GitHub</strong>
                  </>,
                  <>
                    Fritt att <strong>återanvända och vidareutveckla</strong>
                  </>,
                ]}
              />
            }
          >
            <p>
              Sundsvalls kommun arbetar enligt principen <em>öppen källkod först</em> och
              tillgängliggör sina webbapplikationer på GitHub, där de kan användas, granskas och
              vidareutvecklas av andra kommuner, organisationer och intresserade.
            </p>
            <p>
              Varje webbapplikation presenteras på en egen sida med två delar: en verksamhetsnära
              beskrivning av vad tjänsten gör och vem den är till för, samt en teknisk
              dokumentation för dig som vill förstå hur applikationen är byggd eller vill
              återanvända den i din egen organisation.
            </p>
            <p>Katalogen byggs ut successivt med fler applikationer ur kommunens utbud.</p>
          </TwoColumns>
        </PageSection>

        <PageSection id="tjanster" alt>
          <h2 className="font-header">Webbapplikationer i katalogen</h2>
          <p className="text-lead">
            Katalogen omfattar de öppna webbapplikationer som körs i drift, grupperade per
            område. De tre ärendehanteringsapplikationerna bygger på en gemensam öppen kodbas;
            övriga applikationer har var sitt källkodsförråd. Välj en applikation för att läsa
            mer.
          </p>
          {CATEGORY_ORDER.filter((cat) => byCategory.has(cat)).map((cat) => (
            <section key={cat} aria-label={cat}>
              <h3 className="font-header mt-40">{cat}</h3>
              <div className="mt-16 grid gap-24 md:grid-cols-2 xl:grid-cols-3">
                {(byCategory.get(cat) ?? [])
                  .slice()
                  .sort((a, b) => a.namn.toLowerCase().localeCompare(b.namn.toLowerCase(), 'sv'))
                  .map((card) => (
                    <AppCard key={card.href} card={card} />
                  ))}
              </div>
            </section>
          ))}
          <NoteBox>
            Katalogen omfattar samtliga repon som börjar med <code>web-app</code> hos Sundsvalls
            kommun på GitHub. Nya applikationer läggs till efter hand som de publiceras.
          </NoteBox>
        </PageSection>
      </main>
      <SiteFooter
        title="Webbkatalogen"
        description="En översikt över de webbapplikationer som Sundsvalls kommun delar som öppen källkod."
        links={footerLinks}
      />
    </>
  );
}
