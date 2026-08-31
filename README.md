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

- `index.html` / `src/pages/StartPage.tsx` – hela webbplatsen: målarkitekturens
  syfte, arkitekturen på hög nivå (skikt för skikt), fokusområdena för
  egenutveckling, riktlinjerna samt fördjupningslänkar.
- `ekosystemet.html` / `src/pages/EkosystemetPage.tsx` – fristående undersida
  (länkas inte från startsidan) som visar hela ekosystemet i en bild: alla
  webbappar, alla API:er de anropar och API:ernas inbördes integrationer.
- `src/components/` – delade byggblock (sidhuvud, sidfot, hero, kort med mera)
  ovanpå designsystemets komponenter.
- `public/assets/diagrams/malarkitektur.svg` – översiktsritningen av
  målarkitekturen.
- `public/assets/diagrams/egenutveckling.svg` – ritningen över fokusområdena
  för egenutveckling.
- `public/assets/diagrams/ekosystemet.svg` – helhetsritningen över ekosystemet
  med samtliga anropsrelationer.
- `scripts/generate-diagram.py` – genererar de två översiktsritningarna i samma
  diagramstil som katalogernas arkitekturritningar. Rita aldrig för hand –
  ändra i skriptet och generera om.
- `scripts/generate-ekosystem-diagram.py` – genererar helhetsritningen ur en
  ögonblicksbild av katalogernas data (`apis-data.json` och `apps-data.json` i
  [api-catalogue](https://github.com/Public-Service-as-a-Service/api-catalogue)
  respektive
  [web-catalogue](https://github.com/Public-Service-as-a-Service/web-catalogue)).
  Layouten beräknas ur beroendegrafen; uppdatera datalitteralerna i skriptet
  från katalogerna och generera om.
- `.github/workflows/deploy-pages.yml` – arbetsflöde som bygger webbplatsen och
  publicerar den till GitHub Pages.

## Utveckla och bygga

Webbplatsen är en React-applikation som byggs med Vite till statiska filer:

```sh
npm install   # installera beroenden
npm run dev   # utvecklingsserver med omedelbar omladdning
npm run build # bygg produktionsversionen till dist/
```

Designsystemet:

- Komponenter (`Button`, `Card`, `Link`, `Header`, `Footer`, `Logo`, `Label`
  med flera) importeras från `@sk-web-gui/react`.
- Designtokens kommer från `@sk-web-gui/core`, som kopplas in som
  Tailwind-preset i `tailwind.config.js`. Färger, typsnitt och avstånd används
  via klasser som `bg-vattjom-background-200`, `text-dark-secondary`,
  `font-header` och `max-w-content` – aldrig via hårdkodade hex-värden eller
  egna CSS-variabler.
- `GuiProvider` från `@sk-web-gui/react` sätter temats variabler i dokumentet.
- Typsnittet Raleway läses in via paketet `@fontsource/raleway`.

## Publicering

Webbplatsen byggs med `npm run build` och publiceras automatiskt via GitHub
Pages när ändringar pushas till `main`-grenen, på
`https://<organisation>.github.io/target-architecture/`.

Webbplatsen kan även driftsättas som container: `Dockerfile` bygger webbplatsen
i ett Node-steg och serverar `dist/` med nginx på port 80 (används av deployn
till [arkitektur.sundsvall.dev](https://arkitektur.sundsvall.dev/) via Dokploy –
byggtyp Dockerfile, containerport 80). En webhook i repot anropar Dokploy vid
varje push till `main`, så containerdeployn sker automatiskt precis som
GitHub Pages-publiceringen.

## Uppdatera innehållet

Texterna redigeras i `src/pages/StartPage.tsx` respektive
`src/pages/EkosystemetPage.tsx`.
Översiktsdiagrammen ändras i `scripts/generate-diagram.py` följt av
`python3 scripts/generate-diagram.py`; helhetsritningen på ekosystemsidan
ändras i `scripts/generate-ekosystem-diagram.py` följt av
`python3 scripts/generate-ekosystem-diagram.py`.
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
- [API-katalogen](https://api-katalog.sundsvall.dev/index.html)
  och [Webbkatalogen](https://web-katalog.sundsvall.dev/index.html)
- [Sundsvalls kommun på GitHub](https://github.com/Sundsvallskommun)
