FROM nginx:alpine

MAINTAINER skull "824848997@qq.com"

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
