# https://hub.docker.com/repository/docker/omnisci/node-chrome
FROM node:12.16.1-slim

# Install git
RUN apt-get update \
    && apt-get install -y git \
    && rm -rf /var/lib/apt/lists/*

# Install latest chrome dev package
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Non-root default user for node tests
USER node 
