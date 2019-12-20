FROM node:12
MAINTAINER Pedro Oliveira

RUN mkdir /var/www

COPY ./package.json /var/www/
COPY ./bot.js /var/www/
COPY ./auth.json presenceSubreddits* /var/www/

WORKDIR /var/www
RUN npm install
RUN npm install https://github.com/woor/discord.io/tarball/gateway_v6 --save
CMD ["/usr/local/bin/node", "/var/www/bot.js"]