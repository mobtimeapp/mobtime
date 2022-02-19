FROM node:lts-alpine

WORKDIR /web

ADD . ./

RUN apk add curl

RUN npm ci
RUN npm run tailwind

CMD [ "npm", "start"]
