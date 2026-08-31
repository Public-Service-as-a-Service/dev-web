# CLAUDE.md

Webbplats som beskriver Sundsvalls kommuns digitala utveckling och på sikt ska
ersätta [utveckling.sundsvall.se](https://utveckling.sundsvall.se/). Byggd som
en statisk React-webbplats med Vite; en sida (`index.html`) med ingång under
`src/`.

## Avgränsning – obligatorisk

- Innehållet hålls på en **övergripande nivå**: riktning, förhållningssätt och
  strategiska områden – inte arbetssätt, verktyg eller teknikval.
- **Upprepa inte innehållet i utvecklarportalen**
  (devportal.sundsvall.dev): golden paths, DevOps, självservice,
  leveransgrindar och plattformsteam hör hemma där, inte här. Länka inte
  heller dit så länge portalen är under uppbyggnad.
- Fördjupningslänkarna går till målarkitekturen, Kommuna, Webbkatalogen och
  API-katalogen.

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
  `var(--…)` och ingen egen CSS utöver Tailwind-direktiven i `src/index.css` –
  allt utseende ska komma från paketen via komponenter och tokenklasser.
- Färgprofilerna heter `vattjom` (blå, används som primärfärg här), `gronsta`,
  `bjornstigen` och `juniskar`. Typsnitt: Raleway för rubriker via
  `font-header` (läses in från paketet `@fontsource/raleway`), Arial för
  brödtext (temats standard).
- `GuiProvider` (i `src/components/AppShell.tsx`) sätter temats CSS-variabler –
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
- Verifiera före push: kör `npm run build`, rendera sidan med headless
  Chromium i både desktop- och mobilbredd och kontrollera layout, kontrast och
  att inget scrollar horisontellt.
- Publicering sker automatiskt vid push till `main`: GitHub Pages via
  `.github/workflows/deploy-pages.yml` och container via Dokploy-webhook
  (`Dockerfile` bygger med Node och serverar `dist/` med nginx).
