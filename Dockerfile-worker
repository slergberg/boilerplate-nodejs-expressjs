# Base image
FROM node:8.11-alpine

# Base system dependencies
RUN apk add --no-cache \
  curl \
  git

# Application files
ADD . /application
WORKDIR /application
RUN yarn install

# Exposing ports
EXPOSE 3000
