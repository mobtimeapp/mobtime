from node:lts-alpine

WORKDIR /home/www

ADD package.json ./package.json
RUN npm install

ADD public ./public
ADD src ./src
ADD index.js ./index.js
ADD tailwind.config.js ./tailwind.config.js

RUN npm run tailwind

CMD [ "node", "index.js"]