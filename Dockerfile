FROM nginx:1.25
COPY dist/control-center /usr/share/nginx/html
COPY nginx.conf /etc/nginx/vhosts.d/control-center.conf