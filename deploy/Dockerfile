FROM makeomatic/node:9.5.0

# we need internal modules, too
COPY ./root /
WORKDIR /app

# install modules again if we need to rebuild them
RUN \
  apk --no-cache add git && \
  yarn --production && \
  apk del git

# Add image source
ENV NODE_ENV=production HOST=127.0.0.1 PORT=8080

EXPOSE 8080
