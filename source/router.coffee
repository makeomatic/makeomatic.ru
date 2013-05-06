ieEdge = require('./middleware/ieEdgeChromeFrameHeader')

setRoutes = (app)->
  ###
    Index routes
  ###
  app.get '/', ieEdge, require('./controllers/homepage').homepage

  ###
    404 page
  ###
  app.get "/*", (req, res) ->
    res.status 404
    res.render '404', {layout: false}

module.exports = setRoutes