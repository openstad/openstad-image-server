FROM node:8

# Create app directory
WORKDIR /usr/src/app

#ARG NPMSCRIPT=build

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY knexfile.js ./
COPY knex ./knex
COPY .env .
COPY images ./images

COPY knex/migrations ./migrations

RUN npm install
RUN npm install knex -g
#RUN knex migrate:latest
#RUN node db-migrate.js

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3333  8080
#CMD [ "node", "server.js" ]
CMD [ "npm", "run", "start" ]
