###
  Dependencies
###
express        = require 'express'
dot            = require 'express-dot'
async          = require 'async'
_              = require 'lodash'
conf           = require './conf'
util           = require 'util'
pkg            = require '../package.json'
i18n           = require "i18n"

app  = express()
root = __dirname

###
  start the app
###

# один день
oneDay = 86400000
dot.setGlobals {
  pkgVer: pkg.version
}

# функция старта приложения
startApp = ->

  i18n.configure {
    locales: ["ru", "en"]
    directory: "#{__dirname}/../locales"
  }

  blogRU = express.static "#{root}/../blog/public"
  blogEN = express.static "#{root}/../blog_en/public"

  app.configure ->
    #shared settings
    app.set 'env', process.env.NODE_ENV || 'development'
    app.engine 'dot', dot.__express
    # view settings
    app.set 'views'       , "#{root}/views"
    app.set 'view engine' , 'dot'

    app.use express.compress()
    app.use express.static "#{root}/../static/icons", {maxAge: 14*oneDay }
    app.use express.static "#{root}/../static", { maxAge: 365*oneDay }

    app.use express.limit('10mb')
    app.use express.bodyParser()

    # understand which locale we are using
    app.use i18n.init
    app.use (req, res, next)->
      [locale] = req.subdomains
      unless locale == 'en'
        locale = 'ru'
      i18n.setLocale req, locale
      next()

    # сервим статичные файлы для блога
    app.use '/blog/', (req, res, next) ->
      if req.locale is "ru"
        func = blogRU
      else
        func = blogEN

      func req, res, next

    app.use app.router

  app.configure "production", ->
    app.set 'port', process.env.PORT || 80
    app.set 'host', process.env.HOST || '0.0.0.0'
    ## error handler ##
    app.use express.errorHandler
      dumpExceptions: false
      showStack: false
    ## all uncaught errors are processed here ##
    app.use (err,req,res,next) ->
      # custom error page
      console.error err
      res.send "Error", 500

  app.configure "development", ->
    app.set 'port', process.env.PORT || 9100
    app.set 'host', '0.0.0.0'
    app.use express.errorHandler
      dumpExceptions: true
      showStack: true

  app.configure ->
    dot.setGlobals env: app.get('env')

  ###
    Enable routes
  ###
  require('./router')(app)

  ###
    Start the app
  ###
  app.listen app.get('port'), app.get('host'), ->
    util.log util.format('ENV: %s, listening on http://%s:%s', app.get('env'), app.get('host'), app.get('port'))

###
  Export app for some further use
###

startApp()