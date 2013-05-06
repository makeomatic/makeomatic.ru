setRoutes = (app)->
  ###
    Index routes
  ###
  app.get '/', require('./controllers/homepage').homepage

  ###
    404 page
  ###
  app.get "/*", (req, res, next) ->
    res.render '404', {layout: false}, 404

module.exports = setRoutes