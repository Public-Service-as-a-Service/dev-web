# Schemalagd veckosynk av webbkatalogen

Katalogen hålls i synk med produktionen av ett schemalagt Claude-jobb – en
*Routine* i Claude Code på webben – som varje **måndag 07:00 UTC** (09:00
svensk sommartid, 08:00 vintertid) startar en färsk session i katalogens
utvecklingsmiljö. Tidpunkten är vald med flit: den ligger *efter* den
ordinarie SBOM-körningen (`.github/workflows/refresh-sbom.yml`, måndagar
06:00 UTC), så att veckans SBOM:er redan är färska när katalogsynken börjar.

Routinen är knuten till ett konto på claude.ai och syns/pausas/ändras under
**Routines** i Claude Code på webben (eller genom att be Claude lista och
uppdatera den med trigger-verktygen). Den här filen är den granskningsbara
beskrivningen av vad jobbet gör; sessionen som routinen startar instrueras
att läsa och följa den, och vid konflikt har den här filen företräde framför
routinens inbäddade prompt. Ändringar i arbetssättet görs alltså via PR mot
den här filen.

## Steg 1 – synka katalogen mot källkodsrepona

1. Läs `CLAUDE.md` i repots rot – den styr hur katalogen underhålls och hur
   teknisk fakta härleds ur ett `web-app`-repo.
2. Utgå från `scripts/apps-data.json`; fältet `repo` pekar på källkodsrepot
   under `github.com/Sundsvallskommun`. De tre handskrivna sidorna
   (`generisk-arendehantering`, `myndighetsutovning-*`) har ingen post där
   men delar repot i `scripts/sbom-extra.json`.
3. **Nya applikationer.** Lista organisationens repon som börjar med
   `web-app` och som varken finns i datafilen eller i `sbom-extra.json`.
   Klona kandidaterna grunt och bedöm om de är i skarp drift (releaser/
   taggar, aktiv historik, produktionsfärdig konfiguration – prototyper ska
   inte in i katalogen). Kom ihåg uppdelningsregeln i `CLAUDE.md`: ett nytt
   repo är inte automatiskt en ny sida, och en ny instans i ett redan
   katalogfört repo (ny `frontend/.env.<instans>-example`) kan vara en ny
   sida (myndighetsutövning) eller bara en ny rad i en befintlig sidas
   verksamhetslista (generisk lösning). Lägg bara till applikationer där
   bedömningen är säker; lista osäkra kandidater i PR-beskrivningen i
   stället för att gissa – granskaren avgör.
4. **Avvecklade applikationer.** Poster vars källkodsrepo är arkiverat eller
   borttaget behandlas som avvecklade: ta bort posten ur `apps-data.json`
   tillsammans med de genererade filerna (`tjanster/<slug>.html`,
   `tjanster/<slug>-sbom.html`, `assets/diagrams/<slug>.svg`,
   `assets/sbom/<slug>.spdx.json`). Är repot kvar men applikationen
   misstänks vara ur drift av andra skäl: flagga i PR-beskrivningen i
   stället för att ta bort.
5. **Ändrade applikationer.** Klona varje kvarvarande repo grunt och jämför
   med posten enligt tabellen i `CLAUDE.md`: API-listan och versionerna i
   `backend/src/config/api-config.ts` mot `apis`-fältet, instanserna i
   `frontend/.env.<instans>-example` mot verksamhetslistan, funktionsflaggor
   (`NEXT_PUBLIC_USE_*`) mot funktionslistan, teknikstack ur `package.json`.
   Uppdatera posten när något skiljer. Rör en ändring de handskrivna
   sidorna: uppdatera sidan för hand enligt strukturen i `CLAUDE.md` och
   diagrammet via dess `diagram(...)`-anrop i `scripts/generate-diagrams.py`.
6. Kör `python3 scripts/generate-pages.py` följt av
   `python3 scripts/generate-diagrams.py` och verifiera sidorna lokalt med
   headless Chromium enligt `CLAUDE.md`. Skriv aldrig SBOM-filer för hand
   och committa aldrig lokalt regenererade SBOM:er (se `CLAUDE.md`).
7. **Inget skiljer?** Avsluta utan PR och utan brus.
8. Annars: committa på en arbetsgren (`claude/veckosynk-<datum>`), pusha och
   skapa PR mot `main` med en sammanfattning uppdelad i *nya*, *borttagna*
   och *ändrade* applikationer samt eventuella osäkra kandidater.
   Prenumerera på PR:en och driv den till grönt. Merga aldrig själv – en
   människa godkänner.

## Steg 2 – SBOM för nya och ändrade applikationer

Programvaruförteckningarna underhålls uteslutande av
`.github/workflows/refresh-sbom.yml`; de skrivs aldrig för hand (se
`CLAUDE.md`). Steg 2 börjar först när PR:en från steg 1 är mergad till
`main`, eftersom workflowets matris läser `apps-data.json` från `main`:

- **Nya applikationer:** starta `refresh-sbom.yml` manuellt
  (workflow_dispatch) med input `only=<slug>`, en körning per ny applikation,
  så att förteckningen kommer på plats direkt i stället för vid nästa
  veckokörning.
- **Ändrade applikationer:** täcks normalt redan av samma morgons ordinarie
  körning (06:00 UTC). Starta workflowet för en slug bara om källrepots
  beroenden ändrats efter den körningen.
- **Borttagna applikationer:** deras SBOM-filer togs redan bort i steg 1;
  workflowet rör dem inte.

Bevaka att de startade körningarna går igenom; en röd körning felsöks enligt
kommentarerna i workflowfilen.

## Avslut

Sessionen bokar egna avstämningar (ca en timme) tills PR:en är mergad eller
stängd och eventuella SBOM-körningar är klara, och avslutar därefter. Merge
till `main` publicerar katalogen via GitHub Pages som vanligt.
