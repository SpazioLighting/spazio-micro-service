FROM ghcr.io/puppeteer/puppeteer:24.7.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false


WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx tsc

CMD ["node", "dist/app.js"]
