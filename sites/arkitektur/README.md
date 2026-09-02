# Målarkitekturen

En webbplats som beskriver Sundsvalls kommuns målarkitektur på hög nivå samt de
riktlinjer – öppenhet, transparens, återanvändning med flera – som styr
kommunens digitala utveckling.

Beskrivningen hålls medvetet på en abstrakt nivå: skikt, komponenter och
principer, inte teknik- eller produktval. Målarkitekturen omfattar ett ekosystem
av både egenutvecklade och upphandlade komponenter.

Webbplatsen är byggd med [Sundsvalls kommuns designsystem](https://ui.sundsvall.dev/):
komponenter importeras från `@sk-web-gui/react` och alla designtokens (färger,
typografi, avstånd) kommer från `@sk-web-gui/core` via dess Tailwind-preset.
Inga hex-värden eller CSS-variabler hårdkodas i projektet. Allt innehåll är på
svenska.

## Innehåll

- `arkitektur/index.html` / `pages/StartPage.tsx` – hela webbplatsen: målarkitekturens
  syfte, arkitekturen på hög nivå (skikt för skikt), fokusområdena för
  egenutveckling, riktlinjerna samt fördjupningslänkar.
- `arkitektur/ekosystemet.html` / `pages/EkosystemetPage.tsx` – fristående undersida
  (länkas inte från startsidan) som visar hela ekosystemet i en bild: alla
  webbappar, alla API:er de anropar och API:ernas inbördes integrationer.
- `arkitektur/design-principer.html` / `pages/DesignPrinciperPage.tsx` – undersida
  som beskriver designprinciperna – medborgarcentrering, överförbarhet och
  styrning – samt arkitekturens blueprint lager för lager, med exempel ur
  kommunens egna komponenter. Länkas från startsidans huvudmeny och från
  avsnittet Riktlinjer och principer.
- Sidhuvud, sidfot och byggblock kommer från `@sundsvall/chrome`
  (`packages/chrome/`) – sektionen har inga egna kopior.
- `public/arkitektur/assets/diagrams/malarkitektur.svg` – översiktsritningen av
  målarkitekturen.
- `public/arkitektur/assets/diagrams/egenutveckling.svg` – ritningen över fokusområdena
  för egenutveckling.
- `public/arkitektur/assets/diagrams/ekosystemet.svg` – helhetsritningen över ekosystemet
  med samtliga anropsrelationer.
- `public/arkitektur/assets/diagrams/design-principer.svg` – ritningen över arkitekturens
  blueprint med designprinciperna utsatta per lager.
- `sites/arkitektur/scripts/generate-diagram.py` – genererar de två översiktsritningarna i samma
  diagramstil som katalogernas arkitekturritningar. Rita aldrig för hand –
  ändra i skriptet och generera om.
- `sites/arkitektur/scripts/generate-ekosystem-diagram.py` – genererar helhetsritningen ur en
  ögonblicksbild av katalogernas data (`sites/api/scripts/apis-data.json` och
  `sites/tjanster/scripts/apps-data.json` i det här repot).
  Layouten beräknas ur beroendegrafen; uppdatera datalitteralerna i skriptet
  från katalogerna och generera om.
- `sites/arkitektur/scripts/generate-blueprint-diagram.py` – genererar blueprintritningen på
  sidan om designprinciperna, i samma diagramstil som övriga ritningar.

## Utveckla och bygga

Sektionen byggs som en del av webbplatsen. Kör `npm install` och
`npm run build` i repots rot – bygget plockar upp sidskalen under
`arkitektur/` automatiskt.

## Uppdatera innehållet

Texterna redigeras i `pages/StartPage.tsx`, `pages/EkosystemetPage.tsx`
respektive `pages/DesignPrinciperPage.tsx`.
Översiktsdiagrammen ändras i `sites/arkitektur/scripts/generate-diagram.py` följt av
`python3 scripts/generate-diagram.py`; helhetsritningen på ekosystemsidan
ändras i `sites/arkitektur/scripts/generate-ekosystem-diagram.py` och blueprintritningen i
`sites/arkitektur/scripts/generate-blueprint-diagram.py`, båda följt av `python3` på skriptet.
Alla skript skriver till `public/arkitektur/assets/diagrams/`.
Verifiera lokalt innan push: bygg webbplatsen, rendera sidorna med headless
Chromium och kontrollera layout och att diagrammen läses in korrekt.

## Underlag

Innehållet är framtaget ur bland annat:

- [Målbild och strategi](https://utveckling.sundsvall.se/malbild-och-strategi)
  samt [API-strategin](https://utveckling.sundsvall.se/malbild-och-strategi/api-strategi)
  på utveckling.sundsvall.se
- [Digital infrastruktur](https://utveckling.sundsvall.se/digital-infrastruktur)
  med undersidor (digitala kanaler, API-infrastruktur, koncerngemensamma
  komponenter, metakatalogen, datalager, generellt processtöd, paketerade
  lösningar) på utveckling.sundsvall.se
- [kommuna.se](https://kommuna.se/)
- API-katalogen och webbkatalogen, sektionerna `api/` och `tjanster/` i det
  här repot
- [Sundsvalls kommun på GitHub](https://github.com/Sundsvallskommun)
- Per Persson, *Managing Socio-Technical Debt: Causes and Design-Science
  Solutions for Citizen-Centred Digital Public Services* (Göteborgs
  universitet, 2025), <https://hdl.handle.net/2077/90120> – källa till
  designprinciperna och arkitekturblueprinten på sidan om designprinciper.
