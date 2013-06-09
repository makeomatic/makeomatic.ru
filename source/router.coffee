ieEdge             = require('./middleware/ieEdgeChromeFrameHeader')
homepageController = require('./controllers/homepage')
callbackController = require('./controllers/feedback')

setRoutes = (app)->
  ###
    Index routes
  ###
  app.get '/'    , ieEdge, homepageController.homepage
  app.get '/team', ieEdge, homepageController.team

  ###
    Feedback routes
  ###
  app.post '/callback', callbackController.callback
  app.post '/brief',    callbackController.brief

  ###
    404 page
  ###
  app.get "/*", (req, res) ->
    res.status 404
    res.render '404', {layout: false}

module.exports = setRoutes