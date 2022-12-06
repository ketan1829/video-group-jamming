

FROM node:alpine as build 

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx 
EXPOSE 3000

ARG NODE_VERSION=16.14.1
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
  && apt-get update \
  && apt-get autoremove \
  && apt-get install -y nodejs

RUN apt-get update && apt-get install -y npm


COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html


CMD ["npm", "run", "start"]