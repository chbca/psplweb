FROM nginx:alpine

MAINTAINER skull "824848997@qq.com"

COPY landingPage/baking/dist /usr/share/nginx/html/baking
COPY nginx.conf /etc/nginx/nginx.conf
