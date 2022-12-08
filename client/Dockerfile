FROM node:alpine AS builder

ENV NODE_ENV production

WORKDIR /app

COPY ./package.json ./
RUN cd /app & npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx

COPY --from=builder /app/build /usr/share/nginx/html

COPY /nginx/default.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]