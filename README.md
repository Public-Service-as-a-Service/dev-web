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

- `index.html` / `src/pages/StartPage.tsx` – hela webbplatsen: omställningen,
  digital mognad (digital förmåga och digitalt arv), förhållningssätten, de
  strategiska områdena samt fördjupningslänkarna.
- `src/components/` – delade byggblock (sidhuvud, sidfot, hero, kort med mera)
  ovanpå designsystemets komponenter.
- `public/assets/` – ikoner för webbplatsen.
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
`https://<organisation>.github.io/dev-web/`.

Webbplatsen driftsätts även som container: `Dockerfile` bygger webbplatsen i
ett Node-steg och serverar `dist/` med nginx på port 80. Deployn sker via
Dokploy – byggtyp Dockerfile, containerport 80. En webhook i repot anropar
Dokploy vid varje push till `main`, så containerdeployn sker automatiskt precis
som GitHub Pages-publiceringen.

## Uppdatera innehållet

Texterna redigeras i `src/pages/StartPage.tsx`. Menyn, sidfotens länkar och
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
