FROM node:8
MAINTAINER Pedro Oliveira

RUN mkdir /var/www

ADD ./package.json /var/www
ADD ./bot.js /var/www
ADD ./auth.json /var/www

WORKDIR /var/www
RUN npm install request winston@2 https://github.com/woor/discord.io/tarball/gateway_v6 discord.io --save
CMD ["/usr/local/bin/node", "/var/www/bot.js"]