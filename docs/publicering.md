# Publicering och domänbyte

Webbplatsen består av en startsida och tre sektioner som byggs till en enda
uppsättning statiska filer och publiceras som **en** container. Det här
dokumentet beskriver hur den publiceras och hur de fyra gamla domänerna pekas om
till den nya.

## Publicering

**Containern är den enda publiceringen.** `Dockerfile` bygger webbplatsen i ett
Node-steg och serverar `dist/` med nginx på port 80 (`nginx.conf` sätter
cache-huvuden). Byggsteget hämtar först programvaruförteckningarna från
datarepot `sbom-data` med `scripts/fetch-sbom.sh` (grunt klon), så att den här
utcheckningen slipper bära drygt 90 MB data som skrivs om varje vecka. Dokploy bygger om och deployar vid varje push till `main` via
repots webhook – även för commits som SBOM-arbetsflödet gör med `GITHUB_TOKEN`,
eftersom en GitHub-webhook till skillnad från ett arbetsflöde triggas av alla
pushar. Arbetsflödet anropar dessutom Dokploy direkt när hemligheten
`DOKPLOY_WEBHOOK_URL` är satt i repot.

GitHub Pages används inte för den här webbplatsen. Bygget behåller ändå
relativa sökvägar (`base: './'`), så att `dist/` går att förhandsgranska från
valfri katalog.

## Adresser efter hopslagningen

| Sektion | Adress |
| --- | --- |
| Startsidan | `/` |
| Målarkitekturen | `/arkitektur/` |
| Webbkatalogen | `/tjanster/` |
| API-katalogen | `/api/` |

Tjänste- och API-sidornas egna adresser är oförändrade: `/tjanster/<slug>.html`
respektive `/api/<slug>.html` med sina `-sbom`- och `-swagger`-sidor.

## Steg för domänbytet

1. **DNS.** Peka `ekosystemet.sundsvall.dev` på samma värd som de nuvarande
   domänerna. Behåll DNS-posterna för `utveckling`, `arkitektur`, `web-katalog`
   och `api-katalog` – de måste fortsätta svara för att omdirigeringarna ska nå
   fram.
2. **Dokploy.** Sätt `ekosystemet.sundsvall.dev` som domän på appen (byggtyp
   Dockerfile, containerport 80) och låt Let's Encrypt utfärda certifikat.
3. **Omdirigeringar.** Lägg in reglerna nedan i Traefik, inte i containern.
   Imagen ska förbli domänagnostisk – då kan samma image köras i test, i
   förhandsvisning och i produktion.
4. **Verifiera** enligt checklistan längst ned.
5. **Arkivera** `target-architecture`, `web-catalogue` och `api-catalogue` på
   GitHub med en README som pekar hit.

## Omdirigeringar

Alla gamla adresser ska svara `301` till motsvarande adress under den nya
domänen. Sökvägarna skiljer sig åt per domän eftersom katalogerna flyttade ned
ett steg:

| Gammal adress | Ny adress |
| --- | --- |
| `utveckling.sundsvall.dev/<sökväg>` | `ekosystemet.sundsvall.dev/<sökväg>` |
| `arkitektur.sundsvall.dev/<sökväg>` | `ekosystemet.sundsvall.dev/arkitektur/<sökväg>` |
| `web-katalog.sundsvall.dev/tjanster/<sökväg>` | `ekosystemet.sundsvall.dev/tjanster/<sökväg>` |
| `web-katalog.sundsvall.dev/<sökväg>` | `ekosystemet.sundsvall.dev/tjanster/<sökväg>` |
| `api-katalog.sundsvall.dev/api/<sökväg>` | `ekosystemet.sundsvall.dev/api/<sökväg>` |
| `api-katalog.sundsvall.dev/<sökväg>` | `ekosystemet.sundsvall.dev/api/<sökväg>` |

Katalogernas två rader ser lika ut men gör olika saker: den första låter
`/tjanster/pratomaten.html` behålla sin sökväg, den andra flyttar ned allt
annat – startsidan, ritningarna, OpenAPI-specarna och
programvaruförteckningarna – under sektionen. **Ordningen är avgörande**: den
smalare regeln måste komma först, annars blir `/tjanster/x.html` till
`/tjanster/tjanster/x.html`.

### Traefik-etiketter

```yaml
labels:
  - traefik.enable=true

  # Kanonisk domän
  - traefik.http.routers.ekosystemet.rule=Host(`ekosystemet.sundsvall.dev`)
  - traefik.http.routers.ekosystemet.entrypoints=websecure
  - traefik.http.routers.ekosystemet.tls.certresolver=letsencrypt
  - traefik.http.services.ekosystemet.loadbalancer.server.port=80

  # utveckling.sundsvall.dev → samma sökväg
  - traefik.http.middlewares.red-utveckling.redirectregex.regex=^https?://utveckling\.sundsvall\.dev/(.*)
  - traefik.http.middlewares.red-utveckling.redirectregex.replacement=https://ekosystemet.sundsvall.dev/$${1}
  - traefik.http.middlewares.red-utveckling.redirectregex.permanent=true
  - traefik.http.routers.old-utveckling.rule=Host(`utveckling.sundsvall.dev`)
  - traefik.http.routers.old-utveckling.entrypoints=websecure
  - traefik.http.routers.old-utveckling.tls.certresolver=letsencrypt
  - traefik.http.routers.old-utveckling.middlewares=red-utveckling
  - traefik.http.routers.old-utveckling.service=ekosystemet

  # arkitektur.sundsvall.dev → /arkitektur/
  - traefik.http.middlewares.red-arkitektur.redirectregex.regex=^https?://arkitektur\.sundsvall\.dev/(.*)
  - traefik.http.middlewares.red-arkitektur.redirectregex.replacement=https://ekosystemet.sundsvall.dev/arkitektur/$${1}
  - traefik.http.middlewares.red-arkitektur.redirectregex.permanent=true
  - traefik.http.routers.old-arkitektur.rule=Host(`arkitektur.sundsvall.dev`)
  - traefik.http.routers.old-arkitektur.entrypoints=websecure
  - traefik.http.routers.old-arkitektur.tls.certresolver=letsencrypt
  - traefik.http.routers.old-arkitektur.middlewares=red-arkitektur
  - traefik.http.routers.old-arkitektur.service=ekosystemet

  # web-katalog.sundsvall.dev → /tjanster/ (smalare regeln först)
  - traefik.http.middlewares.red-tjanster-sidor.redirectregex.regex=^https?://web-katalog\.sundsvall\.dev/(tjanster/.*)
  - traefik.http.middlewares.red-tjanster-sidor.redirectregex.replacement=https://ekosystemet.sundsvall.dev/$${1}
  - traefik.http.middlewares.red-tjanster-sidor.redirectregex.permanent=true
  - traefik.http.middlewares.red-tjanster.redirectregex.regex=^https?://web-katalog\.sundsvall\.dev/(.*)
  - traefik.http.middlewares.red-tjanster.redirectregex.replacement=https://ekosystemet.sundsvall.dev/tjanster/$${1}
  - traefik.http.middlewares.red-tjanster.redirectregex.permanent=true
  - traefik.http.routers.old-tjanster.rule=Host(`web-katalog.sundsvall.dev`)
  - traefik.http.routers.old-tjanster.entrypoints=websecure
  - traefik.http.routers.old-tjanster.tls.certresolver=letsencrypt
  - traefik.http.routers.old-tjanster.middlewares=red-tjanster-sidor,red-tjanster
  - traefik.http.routers.old-tjanster.service=ekosystemet

  # api-katalog.sundsvall.dev → /api/ (smalare regeln först)
  - traefik.http.middlewares.red-api-sidor.redirectregex.regex=^https?://api-katalog\.sundsvall\.dev/(api/.*)
  - traefik.http.middlewares.red-api-sidor.redirectregex.replacement=https://ekosystemet.sundsvall.dev/$${1}
  - traefik.http.middlewares.red-api-sidor.redirectregex.permanent=true
  - traefik.http.middlewares.red-api.redirectregex.regex=^https?://api-katalog\.sundsvall\.dev/(.*)
  - traefik.http.middlewares.red-api.redirectregex.replacement=https://ekosystemet.sundsvall.dev/api/$${1}
  - traefik.http.middlewares.red-api.redirectregex.permanent=true
  - traefik.http.routers.old-api.rule=Host(`api-katalog.sundsvall.dev`)
  - traefik.http.routers.old-api.entrypoints=websecure
  - traefik.http.routers.old-api.tls.certresolver=letsencrypt
  - traefik.http.routers.old-api.middlewares=red-api-sidor,red-api
  - traefik.http.routers.old-api.service=ekosystemet
```

`$${1}` är dubbla dollartecken med flit: i en Compose-fil blir `$$` ett
enkelt `$` när filen tolkas, och Traefik behöver `${1}`. Skriver du reglerna
direkt i Traefiks egen konfiguration (inte via Compose) ska det vara `${1}`.

Routrarna för de gamla domänerna pekar på samma tjänst som den kanoniska. Det
behövs för att routern ska vara giltig – trafiken når aldrig tjänsten, den
besvaras av omdirigeringen.

## Verifiera

```sh
# Nya domänen svarar
curl -sI https://ekosystemet.sundsvall.dev/ | head -1

# Gamla adresser går vidare till rätt ställe (301 + Location)
for u in https://utveckling.sundsvall.dev/ \
         https://arkitektur.sundsvall.dev/ekosystemet.html \
         https://web-katalog.sundsvall.dev/index.html \
         https://web-katalog.sundsvall.dev/tjanster/pratomaten.html \
         https://api-katalog.sundsvall.dev/index.html \
         https://api-katalog.sundsvall.dev/api/citizen-changes-swagger.html; do
  echo "$u"
  curl -sI "$u" | grep -iE '^(HTTP|location)'
done

# Följ hela kedjan och kontrollera att slutet är 200
curl -sIL https://web-katalog.sundsvall.dev/tjanster/pratomaten.html | grep -iE '^HTTP'
```

Kontrollera dessutom i webbläsaren att en tjänstesida, en API-sida med Swagger
UI och en programvaruförteckning läser in sina filer från
`/tjanster/assets/` respektive `/api/assets/`.

## Om något går fel

Peka tillbaka `ekosystemet.sundsvall.dev` och ta bort omdirigeringarna i
Traefik. De gamla containrarna kan köras vidare från sina arkiverade repon tills
felet är avhjälpt – arkivera dem därför inte förrän omdirigeringarna verifierats
i produktion.

Behåll DNS-posterna och omdirigeringarna för de gamla domänerna långsiktigt.
Adresserna är spridda i dokument, presentationer och andra kommuners
referenser, och en programvaruförteckning namnger sin gamla adress i sitt
SPDX-fält `documentNamespace` – det fältet är en identifierare, inte en länk,
och ska inte skrivas om.
