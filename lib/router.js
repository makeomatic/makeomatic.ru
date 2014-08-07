(function() {
  var callbackController, homepageController, ieEdge, setRoutes;

  ieEdge = require('./middleware/ieEdgeChromeFrameHeader');

  homepageController = require('./controllers/homepage');

  callbackController = require('./controllers/feedback');

  setRoutes = function(app) {

    /*
      Index routes
     */
    app.get('/', ieEdge, homepageController.homepage);
    app.get('/team', ieEdge, homepageController.team);

    /*
      Feedback routes
     */
    app.post('/brief', callbackController.brief);

    /*
      404 page
     */
    return app.get("/*", function(req, res) {
      return res.status(404).render('404', {
        layout: false
      });
    });
  };

  module.exports = setRoutes;

}).call(this);
