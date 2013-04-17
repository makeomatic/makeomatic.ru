setRoutes = (app)->
  ###
    Index routes
  ###
  app.get '/', require('./controllers/homepage').homepage



module.exports = setRoutes