SHELL := /bin/bash
PKG_NAME := $(shell cat package.json | ./node_modules/.bin/json name)
PKG_VERSION := $(shell cat package.json | ./node_modules/.bin/json version)

build:
	npm i
	./node_modules/.bin/grunt production
	./node_modules/.bin/grunt imagemin
	docker build --build-arg VERSION=v5.1.0 -t makeomatic/website:nodejs -f Dockerfile.nodejs .
	docker build -t makeomatic/website:nginx -f Dockerfile.nginx .

push:
	docker push makeomatic/website:nodejs
	docker push makeomatic/website:nginx

.PHONY: build push