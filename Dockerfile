FROM node:10-slim

# Label for tracking
LABEL nl.openstad.container="image" nl.openstad.version="1.1.1" nl.openstad.release-date="2020-05-07"

# Environment variables
ENV DB_NAME=""
ENV DB_USER=""
ENV DB_PASSWORD="abc"
ENV DB_HOST=""
ENV PORT_API=4100
ENV PORT_IMAGE_SERVER=3000
ENV IMAGES_DIR=/home/app/data
ENV THROTTLE=true
ENV THROTTLE_CC_PROCESSORS=4
ENV THROTTLE_CC_PREFETCHER=20
ENV THROTTLE_CC_REQUESTS=100
ENV APP_URL=""
#CAN WE DEFINE THIS AUTOMATICALLY??

# Create app directory
WORKDIR /app

# Copy all content to the Docker image.
COPY . .

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY knexfile.js ./
COPY knex ./knex

RUN mkdir -p images

RUN apt-get update; \
    apt-get install -y python make cmake git g++; \
    npm install --ignore-optional; \
    npm install knex -g; \
    apt-get remove -y make cmake git g++; \
    apt autoremove -y

COPY knex/migrations ./migrations

# Set node ownership to/home/app
RUN chown -R node:node /app
USER node

VOLUME /home/app/data

CMD [ "npm", "start" ]
