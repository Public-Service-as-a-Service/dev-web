# Publicering och domänbyte

Webbplatsen består av en startsida och tre sektioner som byggs till en enda
uppsättning statiska filer och publiceras som **en** container på
`ekosystemet.sundsvall.dev`. Det här dokumentet beskriver hur den publiceras och
vad som hände med de fyra domäner den ersatte.

## Publicering

**Containern är den enda publiceringen.** `Dockerfile` bygger webbplatsen i ett
Node-steg och serverar `dist/` med nginx på port 80 (`nginx.conf` sätter
cache-huvuden). Byggsteget hämtar först programvaruförteckningarna från
datarepot `sbom-data` med `scripts/fetch-sbom.sh` (grunt klon), så att den här
utcheckningen slipper bära drygt 90 MB data som skrivs om varje vecka.

Dokploy bygger om och deployar vid varje push till `main` via
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

## Domänbytet – så gick det till

1. **DNS.** `ekosystemet.sundsvall.dev` pekades på samma värd som de tidigare
   domänerna.
2. **Dokploy.** Domänen sattes på appen (byggtyp Dockerfile, containerport 80)
   med certifikat från Let's Encrypt.
3. **Verifiering** enligt checklistan nedan.
4. **Arkivering** av `target-architecture`, `web-catalogue` och `api-catalogue`
   på GitHub, med README:er som pekar hit.
5. De gamla domänerna togs ur drift **utan omdirigering** – se nedan.

## De gamla domänerna

`utveckling.sundsvall.dev`, `arkitektur.sundsvall.dev`,
`web-katalog.sundsvall.dev` och `api-katalog.sundsvall.dev` svarar `404` och
lämnades så med flit: webbplatserna var under uppbyggnad och adresserna hade
aldrig kommunicerats utåt, så det finns inga spridda länkar att bevara. Nya
läsare hittar hit genom att den nya adressen kommuniceras, inte genom
vidarehopp.

Skulle det senare visa sig att en gammal adress ändå används – i ett dokument,
en presentation eller hos en annan kommun – går omdirigeringar att lägga till i
efterhand. Sökvägarna skiljer sig åt per domän eftersom katalogerna flyttade ned
ett steg:

| Gammal adress | Motsvarar i dag |
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
programvaruförteckningarna – under sektionen. Läggs reglerna in i Traefik
**måste den smalare komma först**, annars blir `/tjanster/x.html` till
`/tjanster/tjanster/x.html`. Reglerna hör hemma på den nuvarande appen, inte i
containern: imagen ska förbli domänagnostisk, och de gamla apparna finns inte
kvar att hänga dem på.

## Verifiera

```sh
# Webbplatsen svarar och sektionerna finns
for u in / /arkitektur/index.html /tjanster/index.html /api/index.html; do
  printf '%-28s ' "$u"
  curl -sI "https://ekosystemet.sundsvall.dev$u" | head -1
done

# Katalogernas egna filer serveras – bevisar att bygget hämtade
# programvaruförteckningarna från datarepot sbom-data
curl -sI https://ekosystemet.sundsvall.dev/tjanster/assets/sbom/pratomaten.spdx.json | head -1
curl -sI https://ekosystemet.sundsvall.dev/api/assets/openapi/citizen-changes.yml | head -1
```

Kontrollera dessutom i webbläsaren att en tjänstesida, en API-sida med Swagger
UI och en programvaruförteckning läser in sina filer från
`/tjanster/assets/` respektive `/api/assets/`.

## Om något går fel

Rulla tillbaka genom att deploya om en tidigare commit av `main` i Dokploy.
De arkiverade repona går att avarkivera om deras innehåll skulle behövas, men
webbplatsen byggs numera bara ur `dev-web` och `sbom-data`.

En programvaruförteckning namnger en gammal adress i sitt SPDX-fält
`documentNamespace`. Det fältet är en identifierare, inte en länk, och skrivs
inte om – det skulle bryta kontinuiteten mot tidigare förteckningar.
