ieEdge             = require('./middleware/ieEdgeChromeFrameHeader')
homepageController = require('./controllers/homepage')

setRoutes = (app)->
  ###
    Index routes
  ###
  app.get '/'    , ieEdge, homepageController.homepage
  app.get '/team', ieEdge, homepageController.team

  ###
    404 page
  ###
  app.get "/*", (req, res) ->
    res.status 404
    res.render '404', {layout: false}

module.exports = setRoutes