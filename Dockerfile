# Base image
FROM node:11.6-alpine

# Base system dependencies
RUN apk add --no-cache \
    curl \
    git

# Application files
ADD . /application
WORKDIR /application
RUN yarn install
