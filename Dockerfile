FROM nginx:1.28
COPY dist/apps/control-center/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/vhosts.d/control-center.conf