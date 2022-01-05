FROM node:lts-alpine

WORKDIR /home/www

ADD package.json ./package.json
ADD package-lock.json ./package-lock.json
RUN npm ci

ADD . ./

RUN npm run tailwind

CMD [ "npm", "start"]