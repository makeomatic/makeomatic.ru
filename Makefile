SHELL := /bin/bash
PKG_NAME := $(shell cat ./app/package.json | ./app/node_modules/.bin/json name)
PKG_VERSION := $(shell cat ./app/package.json | ./app/node_modules/.bin/json version)
BIN := ./node_modules/.bin

install:
	cd ./app; npm i; cd blog; npm install; cd ../blog_en; npm install; cd ../; $(BIN)/grunt production imagemin

build:
	cp -r ./app ./deploy/root/
	docker build -t makeomatc/website:latest -f ./deploy/Dockerfile ./deploy/
	docker tag -f makeomatc/website:latest makeomatc/website:$(PKG_VERSION)

push:
	docker push makeomatic/website:latest
	docker push makeomatic/website:$(PKG_VERSION)

.PHONY: build push install
