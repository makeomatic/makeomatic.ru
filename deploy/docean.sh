#!/bin/bash

function cleanup {
  rm -f ./id_rsa ./id_rsa.insecure ~/.docker/config.json
}
trap cleanup EXIT

openssl rsa -in ./id_rsa -out ./id_rsa.insecure -passin pass:$SSH_PWD
chmod 0400 ./id_rsa.insecure

echo "copying docker-compose file via scp"
scp -i ./id_rsa.insecure ./docker-compose.yml $DEPLOY_USER@$DEPLOY_HOST:~/docker-compose.yml

echo "running ssh-exec"
ssh -i ./id_rsa.insecure $DEPLOY_USER@$DEPLOY_HOST "
docker login --username=\"$DOCKER_LOGIN\" --password=\"$DOCKER_PWD\"
docker-compose pull
docker-compose up -d
docker rmi \$(docker images -f 'dangling=true' -q)
"
