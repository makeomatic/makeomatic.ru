#!/bin/bash

docker login --email="$DOCKER_EMAIL" --username="$DOCKER_LOGIN" --password="$DOCKER_PWD"
make push

eval "$(ssh-agent -s)"
chmod 400 ./id_rsa
echo $SSH_PWD > .echo_ps && chmod 700 .echo_ps
cat ./id_rsa | SSH_ASKPASS=.echo_ps ssh-add -
rm .echo_ps
ssh $DEPLOY_USER@$DEPLOY_HOST "
docker login --email=\"$DOCKER_EMAIL\" --username=\"$DOCKER_LOGIN\" --password=\"$DOCKER_PWD\"
docker-compose pull
docker-compose stop
docker-compose rm -f
docker-compose up -d
docker rmi $(docker images -f \"dangling=true\" -q)
"
