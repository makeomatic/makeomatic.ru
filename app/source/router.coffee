ieEdge             = require('./middleware/ieEdgeChromeFrameHeader')
homepageController = require('./controllers/homepage')
callbackController = require('./controllers/feedback')

setRoutes = (app)->
  ###
    Index routes
  ###
  app.get '/'    , ieEdge, homepageController.homepage
  app.get '/team', ieEdge, homepageController.team
  app.get '/portfolio', ieEdge, homepageController.portfoliopage

  ###
    Feedback routes
  ###
  app.post '/brief',    callbackController.brief

  ###
    404 page
  ###
  app.get "/*", (req, res) ->
    res.status(404).render '404', {layout: false}

module.exports = setRoutes