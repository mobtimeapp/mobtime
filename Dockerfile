FROM node:lts-alpine

RUN apk add curl

WORKDIR /web

CMD [ "npm", "run", "dev"]
