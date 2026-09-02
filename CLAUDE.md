# CLAUDE.md

Sundsvalls kommuns webbplats om den digitala miljön: en startsida och ett antal
sektioner, byggda som en statisk React-webbplats med Vite och publicerade som en
container.

## Struktur – obligatorisk

```
index.html            startsidan            →  /
arkitektur/*.html     målarkitekturen       →  /arkitektur/
tjanster/*.html       webbkatalogen         →  /tjanster/
api/*.html            API-katalogen         →  /api/
packages/chrome/      delad sidchrome (@sundsvall/chrome)
sites/start/          startsidans React-kod
sites/arkitektur/     sektionens React-kod, sidor och diagramgeneratorer
sites/tjanster/       webbkatalogens React-kod, data och generatorer
sites/api/            API-katalogens React-kod, data och generatorer
public/               delade ikoner och sektionernas diagram
scripts/fetch-sbom.sh hämtar programvaruförteckningarna från datarepot
```

- **Sidhuvud, sidfot, appskal och byggblock importeras alltid från
  `@sundsvall/chrome`.** Kopiera aldrig en komponent in i en sektion – det är
  precis den drift hopslagningen tog bort. Behöver en sektion något nytt läggs
  det i paketet.
- **Tvärlänkar mellan sektioner kommer från `sectionLinks()` och
  `footerLinks()`** i `packages/chrome/src/navigation.ts`, med en relativ
  prefix (`'./'` på startsidan, `'../'` i en sektion). Skriv aldrig ut en
  annan sektions webbadress för hand.
- Sidskalen (`*.html`) bär webbadressen; de plockas upp automatiskt av
  `vite.config.ts`. React-koden ligger under `sites/`.
- Sidskalen under `tjanster/` och `api/` **genereras** – ändra i
  `sites/tjanster/scripts/apps-data.json` respektive
  `sites/api/scripts/apis-data.json` och kör om generatorn, redigera dem aldrig
  för hand.
- Programvaruförteckningarna uppdateras av `.github/workflows/refresh-sbom.yml`,
  ett arbetsflöde för båda katalogerna: en körning ger en commit och en deploy.
- **Förteckningarna ligger inte i det här repot** utan i datarepot
  [sbom-data](https://github.com/Public-Service-as-a-Service/sbom-data) – drygt
  90 MB som skrivs om varje vecka. `scripts/fetch-sbom.sh` hämtar dem grunt till
  `public/<sektion>/assets/sbom/` (gitignorerat). **Kör skriptet före
  `npm run build` och före katalogernas `generate-pages.py`** – sidorna bäddar
  in komponentlistorna, och generatorerna avbryter om förteckningarna saknas.

## Avgränsning – obligatorisk

- **Startsidan är en ingång, inte en textsamling.** Fokus ligger på
  **målarkitekturen, webbkatalogen och API-katalogen** – i den ordningen. De
  ligger överst och ska tydligt framgå som det viktiga här. Sakinnehållet hör
  hemma i sektionerna, inte på startsidan.
- Skriv inte tillbaka strategitexterna om omställning, digital mognad,
  förhållningssätt och strategiska områden – de överlappar med innehåll i
  andra kanaler.
- **Upprepa inte innehållet i utvecklarportalen**
  (devportal.sundsvall.dev): golden paths, DevOps, självservice,
  leveransgrindar och plattformsteam hör hemma där, inte här.
- Under **Vidare läsning** ligger Kommuna, Eneo och utvecklarportalen.
  Utvecklarportalen ska alltid märkas tydligt som under utveckling, både med
  etikett och i texten, så länge den byggs upp.

## Designsystem – obligatoriskt

Webbplatsen följer [Sundsvalls kommuns designsystem](https://ui.sundsvall.dev/)
(dokumentation för AI-verktyg: <https://ui.sundsvall.dev/llms-full.txt>) och har
samma grafiska profil som
[arkitektur.sundsvall.dev](https://arkitektur.sundsvall.dev/index.html).

- **Importera komponenter från `@sk-web-gui/react`**: `Button`, `Card`, `Link`,
  `Label`, `Header`, `Footer`, `Logo`, `GuiProvider` med flera. Bygg inte egna
  varianter av komponenter som designsystemet redan har.
- **Alla designtokens kommer från `@sk-web-gui/core`**, inkopplat som
  Tailwind-preset i `tailwind.config.js`. Använd tokenklasser som
  `bg-vattjom-background-200`, `text-dark-secondary`, `border-divider`,
  `font-header`, `text-lead`, `max-w-content`, `rounded-cards` samt
  avståndsskalan (`p-24`, `gap-16`, `py-40` …).
- **Hårdkoda aldrig hex-värden eller CSS-variabler.** Inga `#`-färger, inga
  `var(--…)` och ingen egen CSS utöver Tailwind-direktiven i `packages/chrome/src/index.css` –
  allt utseende ska komma från paketen via komponenter och tokenklasser.
- Färgprofilerna heter `vattjom` (blå, används som primärfärg här), `gronsta`,
  `bjornstigen` och `juniskar`. Typsnitt: Raleway för rubriker via
  `font-header` (läses in från paketet `@fontsource/raleway`), Arial för
  brödtext (temats standard).
- `GuiProvider` (i `packages/chrome/src/AppShell.tsx`) sätter temats CSS-variabler –
  alla sidor ska renderas innanför den.

## Språk och ton

Följ designsystemets tonalitetsriktlinjer
(<https://ui.sundsvall.dev/guidelines/tonalitet/>):

- **Allt innehåll skrivs på svenska** – sidtext, alt-texter, aria-etiketter,
  commit-meddelanden och dokumentation. Klarspråk: du-tilltal, aktiv form,
  korta meningar, vanliga ord.
- **Knapptexter ska vara verb i imperativ**: "Utforska omställningen",
  "Läs våra förhållningssätt" – inte "Till avsnittet", "OK" eller
  substantivfraser. Primärknappar 1–3 ord.
- **Länktext beskriver målet**: "Läs mer om Kommuna" – aldrig bara "Läs mer"
  eller "Klicka här".
- En H1 per sida; H2 för huvudsektioner.

## Tillgänglighet

Webbplatsen ska uppfylla **WCAG 2.2 AA** (DOS-lagen gäller kommunen), se
<https://ui.sundsvall.dev/guidelines/tillganglighet/>:

- HTML-semantik: `<button>` för åtgärder, `<a>` för navigering – aldrig
  `<div onClick>`. Designsystemets komponenter ger fokusring och kontrast.
- Alla bilder har `alt`; dekorativa element får `alt=""` eller `aria-hidden`.
- Verifiera med tangentbordsnavigering och 200 % zoom.

## Arbetsflöde

- `npm install`, `npm run dev` för utveckling, `npm run build` för
  produktionsbygge till `dist/`.
- Verifiera före push: kör `npm run build`, rendera startsidan **och minst en
  sida per sektion** med headless Chromium i både desktop- och mobilbredd och
  kontrollera layout, kontrast, att diagrammen läses in och att länkarna mellan
  sektionerna pekar rätt.
- Publicering sker automatiskt vid push till `main`: **containern via Dokploy
  är den enda publiceringen** (`Dockerfile` bygger med Node och serverar `dist/`
  med nginx enligt `nginx.conf`). **GitHub Pages ska inte användas** – lägg inte
  tillbaka något Pages-arbetsflöde.
- **Behåll `base: './'` i `vite.config.ts`** – alla länkar och sökvägar ska vara
  relativa, aldrig rot-absoluta, så att bygget går att förhandsgranska från en
  underkatalog.
- Domänbyte och omdirigeringar: se `docs/publicering.md`.
