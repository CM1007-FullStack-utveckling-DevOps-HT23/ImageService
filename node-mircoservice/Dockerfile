# Fetching the minified node image on apline linux
FROM node:slim

# Declaring env
ENV NODE_ENV development

# Setting up the work directory
WORKDIR /express-docker

COPY package.json .

# Installing dependencies
RUN npm install

# Copying all the files in our project
COPY . .

ENV SERVER_PORT 5000

# Exposing server port
EXPOSE $SERVER_PORT

# Starting our application
CMD ["npm", "start"]