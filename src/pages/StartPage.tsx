import { Link } from '@sk-web-gui/react';
import { ButtonLink, FactBox, Hero, PageSection, TeaserCard, TwoColumns } from '../components/blocks';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';

const menu = [
  { label: 'Omställningen', href: '#omstallningen' },
  { label: 'Digital mognad', href: '#digital-mognad' },
  { label: 'Förhållningssätt', href: '#forhallningssatt' },
  { label: 'Strategiska områden', href: '#strategiska-omraden' },
  { label: 'Fördjupning', href: '#fordjupning' },
];

const footerLinks = [
  { label: 'Målarkitekturen', href: 'https://arkitektur.sundsvall.dev/index.html', external: true },
  { label: 'Kommuna', href: 'https://kommuna.se/index.html', external: true },
  { label: 'Eneo', href: 'https://eneo.ai/', external: true },
  { label: 'Webbkatalogen', href: 'https://web-katalog.sundsvall.dev/index.html', external: true },
  { label: 'API-katalogen', href: 'https://api-katalog.sundsvall.dev/index.html', external: true },
  { label: 'sundsvall.se', href: 'https://sundsvall.se', external: true },
];

const forhallningssatt = [
  {
    tag: 'Enkelhet',
    title: 'Vi sänker trösklarna',
    text: 'Vi gör det svåra enkelt, för varandra. Vi har alla olika bakgrunder och perspektiv, och vi tror på att sänka trösklarna för varandra. Samtidigt sänker vi trösklarna för att börja använda teknik – vi gör det enklare, för alla.',
  },
  {
    tag: 'Samarbete',
    title: 'Vi krokar arm och jobbar tillsammans',
    text: 'För att lyckas krävs ett lagarbete och ett samspel. Vi krokar därför arm med varandra och utvecklar tillsammans. Det finns inget vi och ni. Genom att jobba tillsammans skapar vi rätt förutsättningar för att lyckas.',
  },
  {
    tag: 'Experiment',
    title: 'Vi vågar experimentera',
    text: 'Vi måste våga experimentera och också misslyckas. Men låt oss göra det snabbt, lära av det och anpassa oss efter lärdomen. Vi behöver hitta sätt att arbeta där vi kan utforska och testa snabbt.',
  },
  {
    tag: 'Tillit',
    title: 'Vi stärker andra och varandra',
    text: 'Vi bygger på varandras resonemang, perspektiv och kunskap. Genom att kroka arm, jobba tillsammans och stärka varandra skapar vi den tillit och de relationer som utvecklingen vilar på.',
  },
  {
    tag: 'Öppenhet',
    title: 'Vi är öppna och transparenta',
    text: 'Vi delar det vi gör, internt och externt. Vi är öppna för vad andra har gjort – kan vi bygga på något som redan finns? Vi tror på ett kollektivt lärande där vi hjälper varandra att hitta vägar framåt.',
  },
  {
    tag: 'Nytta',
    title: 'Vi fokuserar på att realisera nytta',
    text: 'I slutändan handlar allt om att skapa nytta och värde. Därför har vi alltid ett starkt fokus på vilket värde vi avser att skapa, så att det ligger i centrum. Arbetet slutar inte heller för att ett projekt är klart – vi hänger med tills nyttan är uppnådd.',
  },
];

const strategiskaOmraden = [
  {
    tag: 'Grund',
    title: 'Digital mognad som grund',
    text: 'Omställningsförmågan byggs på digital mognad. Vi följer och utvecklar mognaden systematiskt i hela kommunkoncernen i stället för att driva utvecklingen initiativ för initiativ.',
  },
  {
    tag: 'Digitalt arv',
    title: 'Ett förutsättningsskapande digitalt arv',
    text: 'De tekniska förutsättningar vi bygger i dag avgör hur snabbt vi kan förändra oss i morgon. Arvet ska möjliggöra utveckling, inte styra eller hindra den.',
  },
  {
    tag: 'Kompetens',
    title: 'En ökad digital förmåga och digital kompetens',
    text: 'Förmågan att förstå och använda digitaliseringens möjligheter behöver finnas i verksamheten, inte bara hos specialister. Därför utvecklar vi den digitala kompetensen brett.',
  },
  {
    tag: 'Målgrupp',
    title: 'Målgruppens perspektiv i fokus',
    text: 'Utvecklingen utgår från behoven hos dem vi finns till för – invånare, företagare och medarbetare – och prövas mot deras verkliga situation.',
  },
  {
    tag: 'Cybersäkerhet',
    title: 'Trygghet och tillit genom cybersäkerhet',
    text: 'Digital service kräver att människor kan lita på den. Säkerhet och skydd av information är därför en förutsättning för utvecklingen, inte ett efterarbete.',
  },
  {
    tag: 'Innovation',
    title: 'Innovationsfrämjande arbetssätt och förhållningssätt',
    text: 'Vi behöver arbetssätt där idéer kan prövas snabbt och där lärdomar tas till vara. Det förutsätter både utrymme att experimentera och en kultur som tillåter det.',
  },
  {
    tag: 'Öppenhet',
    title: 'Öppenhet för ökad transparens och demokrati',
    text: 'Genom att dela processer, kunskap, data och kod ökar vi insynen i hur den kommunala servicen fungerar och skapar bättre förutsättningar för samverkan och demokrati.',
  },
  {
    tag: 'Data',
    title: 'Data som en strategisk resurs',
    text: 'Data behöver hanteras som en gemensam resurs som kan återanvändas, analyseras och ligga till grund för beslut – i stället för att låsas in i enskilda system.',
  },
  {
    tag: 'AI',
    title: 'AI som stöd för alla, på demokratisk grund',
    text: 'Generativ AI får inte bli en teknik för några få – den ska vara ett stöd för oss alla. Därför bygger vi AI-förmågan på öppenhet och egen kontroll: vi vet var data behandlas, vilka modeller som används och hur svaren kommer till. Det är förutsättningen för att kunna använda AI brett i välfärden med bibehållen insyn, tillit och självbestämmande.',
  },
];

const fordjupning = [
  {
    tag: 'Arkitektur',
    title: 'Målarkitekturen',
    href: 'https://arkitektur.sundsvall.dev/index.html',
    more: 'Utforska målarkitekturen',
    text: 'Riktningen och de väsentliga vägvalen för kommunkoncernens digitala miljö: ett ekosystem av väl avgränsade komponenter som exponerar funktionalitet och data via API:er, samt de riktlinjer som styr utvecklingen.',
  },
  {
    tag: 'Samverkan',
    title: 'Kommuna',
    href: 'https://kommuna.se/index.html',
    more: 'Läs mer om Kommuna',
    text: 'Plattform för delade AI- och digitala tjänster mellan kommuner, där tjänster som utvecklats i en kommun görs tillgängliga för andra. En konkret form för det kollektiva lärande vi tror på.',
  },
  {
    tag: 'AI',
    title: 'Eneo',
    href: 'https://eneo.ai/',
    more: 'Läs mer om Eneo',
    text: 'Den öppna AI-plattformen för offentlig sektor, som Sundsvalls kommun och Ånge kommun utvecklat tillsammans. Generativ AI med svensk datasuveränitet: öppen källkod, drift i egen infrastruktur och lösningar som delas mellan offentliga aktörer.',
  },
  {
    tag: 'Katalog',
    title: 'Webbkatalogen',
    href: 'https://web-katalog.sundsvall.dev/index.html',
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

export function StartPage() {
  return (
    <>
      <SiteHeader menu={menu} />
      <main>
        <Hero
          kicker="Sundsvalls kommun"
          title="Utveckling för ett mer hållbart Sundsvall"
          lead="I Sundsvalls kommun använder vi digitaliseringens möjligheter för att förbättra kvaliteten och öka tryggheten i den kommunala servicen. Genom att vi effektiviserar den kommunala verksamheten frigör vi tid och resurser för att stärka demokratin, öka delaktigheten och självständigheten hos Sundsvalls invånare."
          actions={
            <>
              <ButtonLink as="a" href="#omstallningen" variant="primary" color="vattjom">
                Utforska omställningen
              </ButtonLink>
              <ButtonLink as="a" href="#forhallningssatt" variant="secondary" color="vattjom">
                Läs våra förhållningssätt
              </ButtonLink>
            </>
          }
        />

        <PageSection id="omstallningen">
          <h2 className="font-header">Varför vi ställer om</h2>
          <TwoColumns
            aside={
              <FactBox
                title="Snabbfakta"
                items={[
                  <>
                    Hållbar utveckling kräver en <strong>omställning</strong>, inte högre tempo
                  </>,
                  <>
                    Det digitala är en <strong>möjliggörare</strong> i omställningen
                  </>,
                  <>
                    Omställningsförmågan vilar på <strong>digital mognad</strong>
                  </>,
                  <>
                    Digital mognad = <strong>digital förmåga</strong> och{' '}
                    <strong>digitalt arv</strong>
                  </>,
                  <>
                    Utvecklingen bygger på <strong>gemensamma förhållningssätt</strong>
                  </>,
                ]}
              />
            }
          >
            <p>
              En hållbar utveckling når vi inte genom att springa lite snabbare och jobba lite
              effektivare. Vi måste ställa om till nya sätt att leverera välfärd och service, där
              vi löpande utvecklar och anpassar oss efter omvärldens förändring.
            </p>
            <p>
              Det digitala är en möjliggörare i en sådan omställning. Det kan hjälpa oss att skapa
              ett ökat värde för Sundsvallsborna och våra företagare genom att ge oss möjlighet
              att förändra hur vi utför verksamhet och hur vi ger stöd till våra målgrupper.
            </p>
            <p>
              Men för att lyckas med en omställning krävs en förmåga att ställa om. Det händer
              inte bara för att vi vill det, eller för att vi beslutar om det. För att öka vår
              omställningsförmåga grundar vi vår utveckling i modellen för digital mognad.
            </p>
          </TwoColumns>
        </PageSection>

        <PageSection id="digital-mognad" alt>
          <h2 className="font-header">
            En hållbar utveckling uppnår vi genom en ökad digital mognad
          </h2>
          <p className="text-lead">
            För att öka vår omställningsförmåga utvecklar vi ständigt vår digitala mognad. Det gör
            vi genom att fokusera på två delar: vår digitala förmåga och vårt digitala arv. En hög
            digital förmåga och ett möjliggörande arv skapar tillsammans en hög
            omställningsförmåga.
          </p>
          <div className="mt-32 grid gap-24 md:grid-cols-2">
            <TeaserCard tag="Digital förmåga" title="En hög digital förmåga">
              Digital förmåga är vår förmåga att förstå möjligheterna med det digitala och att
              förstå hur vi kan använda det i vår omställning av verksamhet och arbetssätt. Det
              handlar om organisationens förmåga att utveckla sin verksamhet med stöd av
              digitaliseringens möjligheter.
            </TeaserCard>
            <TeaserCard tag="Digitalt arv" title="Ett möjliggörande digitalt arv">
              Det digitala arvet är alla de tekniska förutsättningar vi har i dag och som påverkar
              vår utveckling. Ett möjliggörande digitalt arv ger en snabb utvecklingstakt där vi
              kan anpassa arbetssätt och teknik efter målgruppens behov, medan ett hindrande arv
              styr hur vi kan utveckla vår verksamhet.
            </TeaserCard>
          </div>
        </PageSection>

        <PageSection id="forhallningssatt">
          <h2 className="font-header">Våra förhållningssätt – grunden vi står på</h2>
          <p className="text-lead">
            Vi tror helhjärtat på att digitalisering i slutändan handlar om ett lagarbete, ett
            samspel mellan många olika parter. Digitaliseringen kräver många olika perspektiv och
            kompetenser för att skapa nytta – med andra ord handlar den i grunden om människor,
            beteende, tillit och relationer. Därför är våra förhållningssätt centrala i all
            utveckling. Det är grunden vi står på.
          </p>
          <div className="mt-32 grid gap-24 md:grid-cols-2 xl:grid-cols-3">
            {forhallningssatt.map((item) => (
              <TeaserCard key={item.title} tag={item.tag} title={item.title}>
                {item.text}
              </TeaserCard>
            ))}
          </div>
        </PageSection>

        <PageSection id="strategiska-omraden" alt>
          <h2 className="font-header">Strategiska områden för en ökad omställningsförmåga</h2>
          <p className="text-lead">
            För att skapa en långsiktig nytta ur digitaliseringen måste vi lyckas inom ett antal
            strategiskt viktiga områden. Långsiktigt handlar det inte om några lyckade projekt,
            utan om att ha skapat rätt förutsättningar för en hållbar utveckling.
          </p>
          <div className="mt-32 grid gap-24 md:grid-cols-2 xl:grid-cols-3">
            {strategiskaOmraden.map((item) => (
              <TeaserCard key={item.title} tag={item.tag} title={item.title}>
                {item.text}
              </TeaserCard>
            ))}
          </div>
        </PageSection>

        <PageSection id="fordjupning">
          <h2 className="font-header">Fördjupning</h2>
          <p className="text-lead">
            Strategin omsätts i verkstad. Här kan du fördjupa dig i hur utvecklingen ser ut i
            praktiken: arkitekturen vi bygger mot, plattformen vi bygger AI på, samverkan med
            andra kommuner och de öppna katalogerna över vad vi har byggt.
          </p>
          <div className="mt-32 grid gap-24 md:grid-cols-2 xl:grid-cols-3">
            {fordjupning.map((item) => (
              <TeaserCard
                key={item.title}
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
      </main>
      <SiteFooter
        title="Utveckling"
        description={
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
        }
        links={footerLinks}
      />
    </>
  );
}
