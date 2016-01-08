#!/bin/bash

/bin/sed -i "s/server<nodejs_server_placeholder>/${NODEJS_PORT_8080_TCP_ADDR}/" /etc/nginx/sites-enabled/makeomatic.ru.conf
nginx
