# Utveckling

En webbplats som beskriver Sundsvalls kommuns digitala utveckling: varför vi
ställer om, hur vi ökar vår omställningsförmåga genom digital mognad, vilka
förhållningssätt utvecklingen vilar på och vilka strategiska områden vi behöver
lyckas inom.

Webbplatsen är på sikt tänkt att ersätta
[utveckling.sundsvall.se](https://utveckling.sundsvall.se/). I det här första
läget beskriver den innehållet på den nuvarande förstasidan och länkar vidare
till de öppna webbplatser som visar utvecklingen i praktiken.

Innehållet hålls medvetet på en övergripande nivå – riktning, förhållningssätt
och strategiska områden, inte arbetssätt eller teknikval. Beskrivningar av
utvecklarnära arbetssätt hör hemma i utvecklarportalen och upprepas inte här.

Webbplatsen är byggd med [Sundsvalls kommuns designsystem](https://ui.sundsvall.dev/):
komponenter importeras från `@sk-web-gui/react` och alla designtokens (färger,
typografi, avstånd) kommer från `@sk-web-gui/core` via dess Tailwind-preset.
Inga hex-värden eller CSS-variabler hårdkodas i projektet. Allt innehåll är på
svenska. Den grafiska profilen är densamma som på
[arkitektur.sundsvall.dev](https://arkitektur.sundsvall.dev/index.html).

## Innehåll

Webbplatsen är ett monorepo: en startsida och en sektion per delwebbplats, som
byggs till en enda uppsättning statiska filer och publiceras som en container.

- `index.html` / `sites/start/StartPage.tsx` – startsidan, ingången till
  målarkitekturen och katalogerna.
- `arkitektur/*.html` / `sites/arkitektur/` – sektionen Målarkitekturen med
  undersidorna Ekosystemet och Designprinciper, samt diagramgeneratorerna. Se
  `sites/arkitektur/README.md`.
- `tjanster/*.html` / `sites/tjanster/` – sektionen Webbkatalogen: startsida,
  37 genererade tjänstesidor med lika många programvaruförteckningar, data och
  generatorer. Se `sites/tjanster/README.md`.
- `api/*.html` / `sites/api/` – sektionen API-katalogen: startsida, 75 API-sidor
  med Swagger UI och programvaruförteckningar, data och generatorer. Se
  `sites/api/README.md`.
- `packages/chrome/` – paketet `@sundsvall/chrome` med sidhuvud, sidfot,
  appskal, byggblock och webbplatsens gemensamma navigation. Sektionerna har
  inga egna kopior av chromet.
- `public/assets/` – delade ikoner. `public/arkitektur/assets/diagrams/`
  och `public/tjanster/assets/` – sektionernas genererade ritningar och
  programvaruförteckningar.
- `.github/workflows/refresh-sbom.yml` – arbetsflöde som varje vecka uppdaterar
  katalogernas programvaruförteckningar från källkodsrepona.

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

Containern är den kanoniska publiceringen: `Dockerfile` bygger webbplatsen i ett
Node-steg och serverar `dist/` med nginx på port 80 (`nginx.conf` sätter
cache-huvuden). En webhook i repot anropar Dokploy vid varje push till `main`.

Webbplatsen publiceras **bara** som container – GitHub Pages används inte.
Bygget använder relativa sökvägar (`base: './'`), så samma artefakt kan serveras
från rot såväl som från en underkatalog vid lokal förhandsgranskning.

Domänbytet till `ekosystemet.sundsvall.dev` och omdirigeringarna från de fyra
gamla domänerna beskrivs i [`docs/publicering.md`](docs/publicering.md).

## Uppdatera innehållet

Texterna redigeras i `sites/start/StartPage.tsx`. Menyn, sidfotens länkar och
korten i respektive avsnitt ligger som datalitteraler överst i samma fil.
Verifiera lokalt innan push: bygg webbplatsen, rendera sidan med headless
Chromium och kontrollera layout i både desktop- och mobilbredd.

## Underlag

Innehållet är framtaget ur bland annat:

- Förstasidan på [utveckling.sundsvall.se](https://utveckling.sundsvall.se/)
  samt [Målbild och strategi](https://utveckling.sundsvall.se/malbild-och-strategi)
  och [AI](https://utveckling.sundsvall.se/ai)
- [Målarkitekturen](https://arkitektur.sundsvall.dev/index.html)
- [kommuna.se](https://kommuna.se/index.html)
- [eneo.ai](https://eneo.ai/)
- [Webbkatalogen](https://web-katalog.sundsvall.dev/index.html)
  och [API-katalogen](https://api-katalog.sundsvall.dev/index.html)
