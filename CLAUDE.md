# CLAUDE.md

Webbplats som beskriver Sundsvalls kommuns målarkitektur. Byggd som en statisk
React-webbplats med Vite; två sidor (`index.html` och `ekosystemet.html`) som
var och en har en egen ingång under `src/`.

## Designsystem – obligatoriskt

Webbplatsen följer [Sundsvalls kommuns designsystem](https://ui.sundsvall.dev/)
(dokumentation för AI-verktyg: <https://ui.sundsvall.dev/llms-full.txt>).

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
- **Knapptexter ska vara verb i imperativ**: "Utforska arkitekturen",
  "Läs våra riktlinjer", "Visa kartan" – inte "Till kartan", "OK" eller
  substantivfraser. Primärknappar 1–3 ord.
- **Länktext beskriver målet**: "Läs mer om Kommuna" – aldrig bara "Läs mer"
  eller "Klicka här".
- En H1 per sida; H2 för huvudsektioner.
- Beskrivningen av arkitekturen hålls på en abstrakt nivå: skikt, komponenter
  och principer – inte teknik- eller produktval.

## Tillgänglighet

Webbplatsen ska uppfylla **WCAG 2.2 AA** (DOS-lagen gäller kommunen), se
<https://ui.sundsvall.dev/guidelines/tillganglighet/>:

- HTML-semantik: `<button>` för åtgärder, `<a>` för navigering – aldrig
  `<div onClick>`. Designsystemets komponenter ger fokusring och kontrast.
- Alla bilder har `alt` (diagrammen har utförliga alt-texter – uppdatera dem
  när diagrammen ändras); dekorativa element får `alt=""` eller
  `aria-hidden`.
- Verifiera med tangentbordsnavigering och 200 % zoom.

## Arbetsflöde

- `npm install`, `npm run dev` för utveckling, `npm run build` för
  produktionsbygge till `dist/`.
- Diagrammen genereras – rita aldrig för hand. Ändra i
  `scripts/generate-diagram.py` respektive
  `scripts/generate-ekosystem-diagram.py` och kör om skriptet med `python3`.
- Verifiera före push: kör `npm run build`, rendera båda sidorna med headless
  Chromium och kontrollera layout, kontrast och att diagrammen läses in.
- Publicering sker automatiskt vid push till `main`: GitHub Pages via
  `.github/workflows/deploy-pages.yml` och container via Dokploy-webhook
  (`Dockerfile` bygger med Node och serverar `dist/` med nginx).
