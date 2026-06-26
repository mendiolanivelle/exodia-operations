FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

COPY --from=build /app/dist /usr/share/nginx/html
COPY server.mjs ./server.mjs

EXPOSE 80

CMD ["node", "server.mjs"]
