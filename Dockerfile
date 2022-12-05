

# Production

# FROM node AS ui-build
# WORKDIR /usr/src/app
# COPY client/ ./client/
# RUN cd client && npm install --legacy-peer-deps && npm run build

# FROM node AS server-build
# WORKDIR /root/
# COPY --from=ui-build /usr/src/app/client/build ./client/build
# COPY server/package*.json ./server/
# RUN cd server && npm install
# COPY server/server.js ./server/

# FROM nginx
# COPY ./default.conf /etc/nginx/conf.d/default.conf


# EXPOSE 3080

# CMD ["node", "./server/server.js"]

# Development

FROM node:alpine
WORKDIR /app
COPY package.json ./
# COPY package-lock.json ./
COPY ./ ./
RUN npm install --legacy-peer-deps
CMD ["npm", "run", "start"]

FROM nginx
COPY ./default.conf /etc/nginx/conf.d/default.conf

FROM node:alpine
WORKDIR /app
COPY package.json ./
# COPY package-lock.json ./
COPY ./ ./
RUN npm i
CMD ["node", "server.js"]




#development mode - OLD

# FROM node:alpine
# WORKDIR /app
# COPY package.json ./
# COPY package-lock.json ./
# COPY ./ ./
# RUN npm i
# CMD ["npm", "run", "start"]