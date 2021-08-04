ARG NODE_VERSION="14"
ARG YARN_VERSION="1.22.11"

ARG NODE_ENV="production"

FROM node:${NODE_VERSION} as base

ENV NODE_ENV="${NODE_ENV}"

COPY . .

RUN npm install --global --force yarn@${YARN_VERSION}

RUN yarn

