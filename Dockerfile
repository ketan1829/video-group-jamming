
# Setup and build the client

FROM node as client

WORKDIR /usr/app/client/
COPY client/package*.json ./
RUN npm install --legacy-peer-deps
COPY client/ ./
RUN npm run build


# Setup the server

FROM node

WORKDIR /usr/app/
COPY --from=client /usr/app/client/build/ ./client/build/

WORKDIR /usr/app/server/
COPY server/package*.json ./
RUN npm install
COPY server/ ./

ENV PORT 3001

EXPOSE 3001

CMD ["node", "index.js"]
