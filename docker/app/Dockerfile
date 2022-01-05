FROM node:lts-alpine

WORKDIR /home/www

ADD package.json ./package.json
RUN npm install

ADD . ./

RUN npm run tailwind

CMD [ "npm", "start"]