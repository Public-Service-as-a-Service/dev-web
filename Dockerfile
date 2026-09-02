FROM node:22-alpine AS build
WORKDIR /app
# git behövs för att hämta programvaruförteckningarna från datarepot.
RUN apk add --no-cache git
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Förteckningarna ligger i ett eget repo och hämtas grunt – se scripts/fetch-sbom.sh.
RUN sh scripts/fetch-sbom.sh
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
