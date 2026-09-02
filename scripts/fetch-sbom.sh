#!/bin/sh
# Hämtar programvaruförteckningarna till public/<sektion>/assets/sbom/.
#
# Förteckningarna ligger i ett eget datarepo i stället för här: de är
# tillsammans drygt 90 MB, skrivs om varje vecka av refresh-sbom.yml och skulle
# annars göra varje utcheckning och byggkontext lika stor. Bygget hämtar dem
# grunt (--depth 1), så bara den senaste versionen laddas ned.
#
# Kör skriptet före `npm run build` och före katalogernas generate-pages.py –
# sidorna bäddar in komponentlistorna ur förteckningarna.
set -eu

REPO="${SBOM_DATA_REPO:-https://github.com/Public-Service-as-a-Service/sbom-data.git}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

git clone --depth 1 --quiet "$REPO" "$TMP"

total=0
for sektion in api tjanster; do
  mal="$ROOT/public/$sektion/assets/sbom"
  mkdir -p "$mal"
  antal=$(find "$TMP/$sektion" -name '*.spdx.json' 2>/dev/null | wc -l)
  if [ "$antal" -eq 0 ]; then
    echo "Varning: inga förteckningar för $sektion i $REPO" >&2
  else
    cp "$TMP/$sektion"/*.spdx.json "$mal/"
  fi
  total=$((total + antal))
done

echo "Hämtade $total programvaruförteckningar från $REPO"
