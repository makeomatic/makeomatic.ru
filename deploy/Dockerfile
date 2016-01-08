FROM smebberson/alpine-nginx-nodejs

# we need internal modules, too
COPY ./root /

# install modules again if we need to rebuild them
RUN cd /app && npm install --production

# Add image source
ENV NODE_ENV=production HOST=127.0.0.1 PORT=8080
