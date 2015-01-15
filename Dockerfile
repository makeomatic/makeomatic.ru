# nodejs application
FROM dockerfile/nodejs
MAINTAINER Vitaly Aminev <v@makeomatic.ru>

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install libpng-dev -y --force-yes

# add node user
RUN useradd -ms /bin/bash node
# copy the nice dotfiles that dockerfile/ubuntu gives us:
RUN cd && cp -R .bashrc .gitconfig .scripts /home/node

ADD ./*.js ./*.json /home/node/app/
ADD ./source /home/node/app/source/
ADD ./static /home/node/app/static/
ADD ./theme-makeomatic /home/node/app/theme-makeomatic/
ADD ./locales /home/node/app/locales/
ADD ./img_source /home/node/app/img_source/
ADD ./blog /home/node/app/blog/
ADD ./blog_en /home/node/app/blog_en/

RUN chown -R node:node /home/node

# switch to node user
USER node
ENV HOME /home/node

WORKDIR /home/node/app

RUN npm install

# build
RUN node /home/node/app/node_modules/.bin/grunt imagemin
RUN node /home/node/app/node_modules/.bin/grunt production

# clean up useless files for smaller image
RUN npm prune --production
RUN find ./blog/* | grep -v '/public' | xargs rm -rf
RUN find ./blog_en/* | grep -v '/public' | xargs rm -rf
RUN rm -rf img_source source theme-makeomatic

ENV NODE_ENV production
ENV HOST 0.0.0.0
ENV PORT 8080

EXPOSE 8080
CMD []
ENTRYPOINT ["/usr/local/bin/npm", "start"]
