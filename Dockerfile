FROM node:alpine

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
#COPY images ./images
RUN mkdir -p images

RUN apk add --no-cache --virtual .gyp python make g++ \
    && npm install  --ignore-optional --ignore-scripts --pure-lockfile --non-interactive \
    && apk del .gyp

RUN npm install knex -g


COPY knex/migrations ./migrations


# Bundle app source
COPY . .

CMD [ "npm", "start" ]
