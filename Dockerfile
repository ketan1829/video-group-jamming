
# build - compile the client
# tiangolo/node-frontend:10 - img has pre-installed nginx default configs + deployment related configs
FROM tiangolo/node-frontend:10 as client

WORKDIR /app
COPY client/package*.json /app/
RUN npm install --legacy-peer-deps
COPY /client /app/

RUN npm run build

# compiled app, ready for production with Nginx

FROM nginx:1.15

# COPY --from=client /app/build/ /usr/share/nginx/html
COPY ./default.conf /etc/nginx/conf.d/default.conf
# Copy the default nginx.conf
COPY --from=client /nginx.conf /etc/nginx/conf.d/default.conf



# Setup the server

FROM node

WORKDIR /app
COPY --from=client /app/client/build/ ./client/build/

WORKDIR /app/server/
COPY server/package*.json ./
RUN npm install
COPY server/ ./

ENV PORT 3001

EXPOSE 3001


RUN npm start run

CMD ["npm", "run", "start"]
