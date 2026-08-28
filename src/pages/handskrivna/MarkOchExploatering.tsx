import { AppArticle } from '../../components/AppArticle';
import {
  drakenArkitekturIntro,
  drakenDiagramCaption,
  drakenFactLinks,
  drakenKallkod,
  drakenKonfiguration,
  drakenTeknik,
} from './draken';

export function MarkOchExploatering() {
  return (
    <AppArticle
      titel="Myndighetsutövning – mark och exploatering"
      kategori="Myndighetsutövning"
      ingress="En webbapplikation som stödjer kommunens handläggning av mark- och exploateringsärenden – från inkommet ärende till avtal, beslut och fakturering."
      beskrivning={[
        'Kommunens mark- och exploateringsverksamhet hanterar ärenden som rör den mark kommunen äger: arrenden och andra upplåtelser, försäljning och köp av mark, servitut samt frågor kopplade till exploatering och samhällsbyggnadsprojekt. Ärendena innebär myndighetsutövning och ställer höga krav på spårbarhet, korrekt dokumentation och enhetlig handläggning.',
        'Applikationen ger handläggarna ett samlat arbetsstöd. Varje ärende följer en standardiserad process där handläggaren har tillgång till uppgifter om berörda parter och fastigheter, kan kommunicera med sökande direkt från ärendet, upprätta avtal utifrån gemensamma mallar och följa ärendets status hela vägen till avslut.',
        'Genom kopplingen till fastighetsinformation och kommunens avtals- och faktureringsflöden minskar dubbelarbetet: uppgifter hämtas där de redan finns, och underlag för fakturering skapas som en del av handläggningen i stället för i efterhand.',
      ]}
      funktionerTitel="Det här stödjer applikationen"
      funktioner={[
        <>
          <strong>Ärendehantering</strong> – registrering, utredning, beslut och avslut enligt en
          enhetlig process.
        </>,
        <>
          <strong>Fastighetsinformation</strong> – uppslag av uppgifter om berörda fastigheter
          direkt i ärendet.
        </>,
        <>
          <strong>Avtal</strong> – upprättande och hantering av till exempel arrende- och
          köpeavtal.
        </>,
        <>
          <strong>Kommunikation</strong> – meddelanden till sökande och andra parter från
          ärendet.
        </>,
        <>
          <strong>Fakturering</strong> – underlag för fakturering skapas som en del av
          handläggningen.
        </>,
      ]}
      factItems={[
        <>
          Målgrupp: <strong>handläggare</strong> inom mark och exploatering
        </>,
        <>
          Typ: <strong>myndighetsutövning</strong>
        </>,
        <>
          Koppling till <strong>fastighets-, avtals- och faktureringsdata</strong>
        </>,
        <>
          Delas som <strong>öppen källkod</strong>
        </>,
      ]}
      factLinks={drakenFactLinks}
      diagramSlug="myndighetsutovning-mark-och-exploatering"
      diagramAlt="Lösningsarkitektur för myndighetsutövning mark och exploatering: webbappen anropar verksamhets- och master-data-API:er via kommunens API-plattform WSO2, med inloggning via SAML."
      diagramCaption={drakenDiagramCaption}
      arkitektur={[
        drakenArkitekturIntro,
        'Applikationen delar kodbas med kommunens övriga ärendehanteringsapplikationer. Mark- och exploateringsinstansen byggs och konfigureras separat, med de API-kopplingar och funktioner som verksamheten behöver.',
      ]}
      teknik={drakenTeknik}
      apiRows={[
        { name: 'CaseData', version: '13.0', usage: 'Kärnan i ärendehanteringen – ärenden, utredning, beslut och status' },
        { name: 'Contract', version: '9.0', usage: 'Avtal, till exempel arrende- och köpeavtal' },
        { name: 'Estateinfo', version: '2.2', usage: 'Fastighetsinformation om berörda fastigheter' },
        { name: 'Messaging', version: '7.10', usage: 'Meddelanden till sökande och andra parter (e-post, sms, digital brevlåda)' },
        { name: 'BillingPreprocessor', version: '4.5', usage: 'Förberedelse av faktureringsunderlag' },
        { name: 'BillingDataCollector', version: '2.1', usage: 'Insamling av faktureringsdata' },
        { name: 'CaseStatus', version: '4.3', usage: 'Statusinformation om ärenden' },
        { name: 'Relations', version: '1.1', usage: 'Relationer mellan ärenden' },
        { name: 'Templating', version: '2.1', usage: 'Mallar för brev, beslut och andra dokument' },
        { name: 'Company', version: '1.0', usage: 'Företagsuppslag' },
        { name: 'Citizen', version: '3.0', usage: 'Uppgifter om invånare' },
        { name: 'Employee', version: '2.0', usage: 'Uppgifter om medarbetare' },
        { name: 'LegalEntity', version: '2.0', usage: 'Uppgifter om organisationer och företag' },
        { name: 'Party', version: '2.1', usage: 'Id-översättning av parter i ärenden' },
        { name: 'ActiveDirectory', version: '2.0', usage: 'Uppslag av användare och behörigheter' },
      ]}
      konfiguration={drakenKonfiguration('en instans')}
      kallkod={drakenKallkod}
    />
  );
}
