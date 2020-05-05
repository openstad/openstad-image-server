FROM node:8


# Create app directory
WORKDIR /app

# Copy all content to the Docker image.
COPY . .

#ARG NPMSCRIPT=build

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY knexfile.js ./
COPY knex ./knex
COPY images ./images

#RUN apk add --no-cache --update openssl g++ make python musl-dev nodejs npm


COPY knex/migrations ./migrations

RUN npm install
RUN npm install knex -g

#RUN knex migrate:latest


#RUN node db-migrate.js

# If you are building your code for production
# RUN npm ci --only=production
#RUN apk del make python g++ && rm -rf /var/cache/apk/*

# Bundle app source
COPY . .

CMD [ "npm", "start" ]
