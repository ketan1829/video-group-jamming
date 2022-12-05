


FROM node:10 AS ui-build
WORKDIR /usr/src/app
COPY client/ ./client/
RUN cd client && npm install && npm run build

FROM node:10 AS server-build
WORKDIR /root/
COPY --from=ui-build /usr/src/app/client/build ./client/build
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server/server.js ./server/

FROM nginx
COPY ./default.conf /etc/nginx/conf.d/default.conf

EXPOSE 3080

CMD ["node", "./server/server.js"]


# FROM node:alpine

# RUN mkdir -p /app
# WORKDIR /app
# COPY ./server/package.json /app
# RUN npm install && npm cache clean --force
# COPY ./ /app
# RUN npm run ket-postbuild
# EXPOSE 80

# CMD [ \"npm\", \"start\" ]"



#development mode - OLD

# FROM node:alpine
# WORKDIR /app
# COPY package.json ./
# COPY package-lock.json ./
# COPY ./ ./
# RUN npm i
# CMD ["npm", "run", "start"]