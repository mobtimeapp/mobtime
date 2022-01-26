FROM node:lts-alpine

WORKDIR /web

ADD . ./

RUN npm ci
RUN npm run tailwind

CMD [ "npm", "run", "dev"]
