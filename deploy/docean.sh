#!/bin/bash

function cleanup {
  rm ./id_rsa ./id_rsa.insecure
}
trap cleanup EXIT

docker login --email="$DOCKER_EMAIL" --username="$DOCKER_LOGIN" --password="$DOCKER_PWD" || exit 1
make push || exit 1

openssl rsa -in ./id_rsa -out ./id_rsa.insecure -passin pass:$SSH_PWD
chmod 0400 ./id_rsa.insecure
scp -i ./id_rsa.insecure ./docker-compose.yml $DEPLOY_USER@$DEPLOY_HOST:~/docker-compose.yml
ssh -i ./id_rsa.insecure $DEPLOY_USER@$DEPLOY_HOST "
docker login --email=\"$DOCKER_EMAIL\" --username=\"$DOCKER_LOGIN\" --password=\"$DOCKER_PWD\"
docker-compose pull
docker-compose stop
docker-compose rm -f
docker-compose up -d
docker rmi $(docker images -f \"dangling=true\" -q)
"
