FROM --platform=linux/arm64 node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV PORT=3001

EXPOSE 3001

CMD ["node", "build"]