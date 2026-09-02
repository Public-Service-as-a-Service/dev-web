import {
  Hero,
  PageSection,
  SiteFooter,
  SiteHeader,
  TeaserCard,
  footerLinks,
  sectionLinks,
} from '@sundsvall/chrome';

const menu = [...sectionLinks(), { label: 'Vidare läsning', href: '#vidare-lasning' }];

const huvudingangar = [
  {
    tag: 'Arkitektur',
    title: 'Målarkitekturen',
    href: './arkitektur/index.html',
    more: 'Utforska målarkitekturen',
    text: 'Riktningen och de väsentliga vägvalen för kommunkoncernens digitala miljö: ett ekosystem av väl avgränsade komponenter som exponerar funktionalitet och data via API:er, samt de riktlinjer som styr utvecklingen.',
  },
  {
    tag: 'Katalog',
    title: 'Webbkatalogen',
    href: './tjanster/index.html',
    more: 'Utforska webbkatalogen',
    text: 'De webbapplikationer kommunen publicerar som öppen källkod – vad varje tjänst gör, vem den är till för och hur den är uppbyggd.',
  },
  {
    tag: 'Katalog',
    title: 'API-katalogen',
    href: 'https://api-katalog.sundsvall.dev/index.html',
    more: 'Utforska API-katalogen',
    text: 'De API:er som körs i produktion på kommunens API-plattform, med beskrivningar, arkitekturritningar och interaktiv dokumentation.',
  },
];

const vidareLasning = [
  {
    tag: 'Samverkan',
    title: 'Kommuna',
    href: 'https://kommuna.se/index.html',
    more: 'Läs mer om Kommuna',
    text: 'Plattform för delade AI- och digitala tjänster mellan kommuner, där tjänster som utvecklats i en kommun görs tillgängliga för andra.',
  },
  {
    tag: 'AI',
    title: 'Eneo',
    href: 'https://eneo.ai/',
    more: 'Läs mer om Eneo',
    text: 'Den öppna AI-plattformen för offentlig sektor, som Sundsvalls kommun och Ånge kommun utvecklat tillsammans. Generativ AI med svensk datasuveränitet: öppen källkod, drift i egen infrastruktur och lösningar som delas mellan offentliga aktörer.',
  },
  {
    tag: 'Under utveckling',
    tagColor: 'warning',
    title: 'Utvecklarportalen',
    href: 'https://devportal.sundsvall.dev/',
    more: 'Följ arbetet med utvecklarportalen',
    text: (
      <>
        <strong>Portalen är under utveckling.</strong> Innehållet är ofullständigt, ändras löpande
        och ska ännu inte användas som facit. Här samlar vi framöver det du behöver för att bygga
        tjänster i kommunens digitala miljö.
      </>
    ),
  },
];

export function StartPage() {
  return (
    <>
      <SiteHeader menu={menu} />
      <main>
        <Hero
          kicker="Sundsvalls kommun"
          title="Målarkitektur, webbkatalog och API-katalog"
          lead="Det här är ingången till Sundsvalls kommuns digitala miljö. Här hittar du riktningen vi bygger mot, de webbapplikationer vi publicerar som öppen källkod och de API:er som körs i produktion."
        />

        <PageSection>
          <h2 className="font-header">Här börjar du</h2>
          <p className="text-lead">
            Tre ingångar bär den här webbplatsen. Börja med målarkitekturen om du vill förstå
            riktningen, med katalogerna om du vill se vad vi har byggt.
          </p>
          <div className="mt-32 grid gap-24 md:grid-cols-3">
            {huvudingangar.map((item) => (
              <TeaserCard
                key={item.title}
                color="vattjom"
                tag={item.tag}
                title={item.title}
                href={item.href}
                more={item.more}
              >
                {item.text}
              </TeaserCard>
            ))}
          </div>
        </PageSection>

        <PageSection id="vidare-lasning" alt>
          <h2 className="font-header">Vidare läsning</h2>
          <p className="text-lead">
            Vill du läsa vidare finns det mer att hämta hos våra grannar och i portalen för dig som
            utvecklar.
          </p>
          <div className="mt-32 grid gap-24 md:grid-cols-2 xl:grid-cols-3">
            {vidareLasning.map((item) => (
              <TeaserCard
                key={item.title}
                tag={item.tag}
                tagColor={item.tagColor}
                title={item.title}
                href={item.href}
                more={item.more}
              >
                {item.text}
              </TeaserCard>
            ))}
          </div>
        </PageSection>
      </main>
      <SiteFooter links={footerLinks()} />
    </>
  );
}
