SHELL := /bin/bash
ROOT := ./app
BIN := ./node_modules/.bin
JSON = $(ROOT)/$(BIN)/json
PKG_NAME = $(shell cat $(ROOT)/package.json | $(JSON) name)
PKG_VERSION = $(shell cat $(ROOT)/package.json | $(JSON) version)

install:
	cd $(ROOT); yarn; cd blog; yarn; cd ../blog_en; yarn; cd ../; $(BIN)/grunt production imagemin

build:
	cp -r ./app ./deploy/root/
	docker build -t makeomatic/website:latest -f ./deploy/Dockerfile ./deploy/
	docker tag makeomatic/website:latest makeomatic/website:$(PKG_VERSION)

push:
	docker push makeomatic/website

.PHONY: build push install
