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
bodyParser     = require "body-parser"
errorHandler   = require "errorhandler"
path           = require "path"

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

  #shared settings
  app.set 'env', process.env.NODE_ENV || 'development'
  app.engine 'dot', dot.__express
  # view settings
  app.set 'views'      , "#{root}/views"
  app.set 'view engine', 'dot'

  app.use require('compression')()
  app.use express.static "#{root}/../static/icons", { maxAge: 365*oneDay }

  # understand which locale we are using
  app.use i18n.init
  app.use (req, res, next)->
    [locale] = req.subdomains
    unless locale == 'en'
      locale = 'ru'
    i18n.setLocale req, locale
    next()

  app.use '/robots.txt', (req, res, next) ->
    if req.locale is 'ru'
      res.sendFile path.resolve("#{root}/../static/robots.txt")
    else
      res.sendFile path.resolve("#{root}/../static/robots.en.txt")

  app.use express.static "#{root}/../static", { maxAge: 365*oneDay }

  app.use bodyParser.urlencoded({ extended: true, limit: '5mb' })
  app.use bodyParser.json()

  # сервим статичные файлы для блога
  app.use '/blog/', (req, res, next) ->
    if req.locale is "ru"
      func = blogRU
    else
      func = blogEN

    func req, res, next

  ###
    Enable routes
  ###
  require('./router')(app)

  if process.env.NODE_ENV is 'production'

    app.set 'port', process.env.PORT || 80
    app.set 'host', process.env.HOST || '0.0.0.0'

    ## all uncaught errors are processed here ##
    app.use (err,req,res,next) ->
      # custom error page
      console.error err
      res.send "Error", 500

  else

    app.set 'port', process.env.PORT || 9100
    app.set 'host', '0.0.0.0'
    app.use errorHandler()

  dot.setGlobals env: app.get('env')

  ###
    Start the app
  ###
  app.listen app.get('port'), app.get('host'), ->
    util.log util.format('ENV: %s, listening on http://%s:%s', app.get('env'), app.get('host'), app.get('port'))

###
  Export app for some further use
###

startApp()