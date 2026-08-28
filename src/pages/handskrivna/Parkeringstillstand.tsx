import { AppArticle } from '../../components/AppArticle';
import {
  drakenArkitekturIntro,
  drakenDiagramCaption,
  drakenFactLinks,
  drakenKallkod,
  drakenKonfiguration,
  drakenTeknik,
} from './draken';

export function Parkeringstillstand() {
  return (
    <AppArticle
      titel="Myndighetsutövning – parkeringstillstånd"
      kategori="Myndighetsutövning"
      ingress="En webbapplikation för digital handläggning av parkeringstillstånd för rörelsehindrade – från ansökan och utredning till beslut och utfärdat tillstånd."
      beskrivning={[
        'Kommunen prövar ansökningar om parkeringstillstånd för rörelsehindrade – ett beslut som är myndighetsutövning och som har stor betydelse i vardagen för den som ansöker. Handläggningen ska vara rättssäker, enhetlig och gå att följa i efterhand.',
        'Applikationen ger handläggarna ett digitalt stöd genom hela processen. Ansökningar registreras som ärenden och följer en standardiserad handläggningsgång: utredning, eventuell komplettering, beslut och – vid bifall – utfärdande av själva tillståndet. Handläggaren har tillgång till uppgifter om den sökande, kan kommunicera direkt från ärendet och använder gemensamma mallar för brev och beslut.',
        'Utfärdade tillstånd registreras digitalt, vilket gör det enkelt att se vilka tillstånd en person har, när de går ut och när det är dags för förnyelse. Strukturerade ansökningsuppgifter kontrolleras automatiskt mot fastställda regler, vilket minskar risken för fel och frigör tid för själva bedömningen.',
      ]}
      funktionerTitel="Det här stödjer applikationen"
      funktioner={[
        <>
          <strong>Ärendehantering</strong> – registrering, utredning, beslut och avslut enligt en
          enhetlig process.
        </>,
        <>
          <strong>Tillståndsregister</strong> – utfärdade parkeringstillstånd registreras och
          följs digitalt.
        </>,
        <>
          <strong>Kommunikation</strong> – meddelanden till sökande direkt från ärendet.
        </>,
        <>
          <strong>Validering</strong> – strukturerade ansökningsuppgifter kontrolleras mot
          fastställda regler.
        </>,
        <>
          <strong>Beslutsdokument</strong> – brev och beslut skapas utifrån gemensamma mallar.
        </>,
      ]}
      factItems={[
        <>
          Målgrupp: <strong>handläggare</strong> av parkeringstillstånd
        </>,
        <>
          Typ: <strong>myndighetsutövning</strong>
        </>,
        <>
          Digitalt <strong>tillståndsregister</strong>
        </>,
        <>
          Delas som <strong>öppen källkod</strong>
        </>,
      ]}
      factLinks={drakenFactLinks}
      diagramSlug="myndighetsutovning-parkeringstillstand"
      diagramAlt="Lösningsarkitektur för myndighetsutövning parkeringstillstånd: webbappen anropar verksamhets- och master-data-API:er via kommunens API-plattform WSO2, med inloggning via SAML."
      diagramCaption={drakenDiagramCaption}
      arkitektur={[
        drakenArkitekturIntro,
        'Applikationen delar kodbas med kommunens övriga ärendehanteringsapplikationer. Parkeringstillståndsinstansen byggs och konfigureras separat, med de API-kopplingar och funktioner som verksamheten behöver.',
      ]}
      teknik={drakenTeknik}
      apiRows={[
        { name: 'CaseData', version: '13.0', usage: 'Kärnan i ärendehanteringen – ärenden, utredning, beslut och status' },
        { name: 'PartyAssets', version: '6.5', usage: 'Register över utfärdade tillstånd kopplade till person' },
        { name: 'JsonSchema', version: '1.0', usage: 'Validering av strukturerade ansökningsuppgifter' },
        { name: 'Messaging', version: '7.10', usage: 'Meddelanden till sökande (sms och digital brevlåda; e-post används inte)' },
        { name: 'CaseStatus', version: '4.3', usage: 'Statusinformation om ärenden' },
        { name: 'Relations', version: '1.1', usage: 'Relationer mellan ärenden' },
        { name: 'Templating', version: '2.1', usage: 'Mallar för brev, beslut och andra dokument' },
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
