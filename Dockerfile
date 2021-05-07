FROM node:16.1-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn

COPY . ./
RUN yarn tailwind:dev

EXPOSE 1234

ENV PORT "1234"
ENV HOST "0.0.0.0"

CMD ["yarn", "start"]
