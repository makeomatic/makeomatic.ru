#!/bin/bash

docker login --email="$DOCKER_EMAIL" --username="$DOCKER_LOGIN" --password="$DOCKER_PWD"
make push

eval "$(ssh-agent -s)"
openssl aes-256-cbc -K $encrypted_23bd8dcc3242_key -iv $encrypted_23bd8dcc3242_iv -in ./crypto/id_rsa.enc -out ./id_rsa.pem -d
chmod 400 ./id_rsa.pem
echo $SSH_PWD > .echo_ps && chmod 700 .echo_ps
cat ./id_rsa.pem | SSH_ASKPASS=.echo_ps ssh-add -
rm .echo_ps
ssh $DEPLOY_USER@$DEPLOY_HOST "
docker login --email=\"$DOCKER_EMAIL\" --username=\"$DOCKER_LOGIN\" --password=\"$DOCKER_PWD\"
docker-compose pull
docker-compose stop
docker-compose rm -f
docker-compose up -d
docker rmi $(docker images -f \"dangling=true\" -q)
"
