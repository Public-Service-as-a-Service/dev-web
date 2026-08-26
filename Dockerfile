FROM nginx:alpine

COPY index.html /usr/share/nginx/html/
COPY tjanster /usr/share/nginx/html/tjanster
COPY assets /usr/share/nginx/html/assets

EXPOSE 80
