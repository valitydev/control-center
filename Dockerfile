FROM nginx:1.29
COPY dist/control-center/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/vhosts.d/control-center.conf