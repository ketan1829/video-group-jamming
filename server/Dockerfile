# Specify a base image
FROM node:alpine AS alpine

WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install 
COPY . .

EXPOSE 3001

# Default command
CMD ["npm", "run", "start"]
