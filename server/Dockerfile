FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm run build

COPY . .

EXPOSE 5001

CMD ["node", "index.js"]
