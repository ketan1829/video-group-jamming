


FROM node:alpine

RUN mkdir -p /app
WORKDIR /app
COPY ./server/package.json /app
RUN npm install && npm cache clean --force",
COPY ./ /app
RUN npm run ket-postbuild
EXPOSE 80

CMD [ \"npm\", \"start\" ]"



#development mode - OLD

# FROM node:alpine
# WORKDIR /app
# COPY package.json ./
# COPY package-lock.json ./
# COPY ./ ./
# RUN npm i
# CMD ["npm", "run", "start"]