# Image used for building dependencies
FROM node:16.16-slim as builder

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node:node package*.json ./

RUN   apt-get update \
&&    apt-get install -y python3 make cmake git bash g++ \
&&    npm config set unsafe-perm true \
&&    npm install --no-optional --legacy-peer-deps

# Release image 
FROM node:16.16-slim

# Label for tracking
LABEL nl.openstad.container="image" nl.openstad.version="1.1.1" nl.openstad.release-date="2020-05-07"

# Environment variables
ENV DB_NAME=""
ENV DB_USER=""
ENV DB_PASSWORD="abc"
ENV DB_HOST=""
ENV PORT_IMAGE_SERVER=3000
ENV IMAGES_DIR=/app/images
ENV THROTTLE=true
ENV THROTTLE_CC_PROCESSORS=4
ENV THROTTLE_CC_PREFETCHER=20
ENV THROTTLE_CC_REQUESTS=100
ENV APP_URL=""
ENV S3_ENDPOINT=""
ENV S3_KEY=""
ENV S3_SECRET=""
ENV S3_BUCKET=""
#CAN WE DEFINE THIS AUTOMATICALLY??

# Create app directory
WORKDIR /app

# Set node ownership to/home/app
RUN mkdir -p images \
&&  npm install -g knex

COPY --chown=node:node --from=builder /app .
COPY --chown=node:node . .
USER node

VOLUME /app/images

CMD [ "npm", "start" ]
