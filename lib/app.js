/*
  Dependencies
*/


(function() {
  var app, async, conf, dot, express, oneDay, pkg, root, startApp, util, _;

  express = require('express');

  dot = require('express-dot');

  async = require('async');

  _ = require('lodash');

  conf = require('./conf');

  util = require('util');

  pkg = require('../package.json');

  app = express();

  root = __dirname;

  /*
    start the app
  */


  oneDay = 86400000;

  dot.setGlobals({
    pkgVer: pkg.version
  });

  startApp = function() {
    app.configure(function() {
      app.set('env', process.env.NODE_ENV || 'development');
      app.engine('dot', dot.__express);
      app.set('views', "" + root + "/views");
      app.set('view engine', 'dot');
      app.use(express.compress());
      app.use(express.limit('10mb'));
      app.use(express.bodyParser());
      app.use(express["static"]("" + root + "/../static/icons", {
        maxAge: 14 * oneDay
      }));
      app.use(express["static"]("" + root + "/../static", {
        maxAge: 365 * oneDay
      }));
      app.use('/blog/', express["static"]("" + root + "/../blog/public"));
      app.use(express.methodOverride());
      return app.use(app.router);
    });
    app.configure("production", function() {
      app.set('port', process.env.PORT || 80);
      app.set('host', process.env.HOST || '0.0.0.0');
      app.use(express.errorHandler({
        dumpExceptions: false,
        showStack: false
      }));
      return app.use(function(err, req, res, next) {
        console.error(err);
        return res.send("Error", 500);
      });
    });
    app.configure("development", function() {
      app.set('port', process.env.PORT || 9100);
      app.set('host', '0.0.0.0');
      return app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
      }));
    });
    app.configure(function() {
      return dot.setGlobals({
        env: app.get('env')
      });
    });
    /*
      Enable routes
    */

    require('./router')(app);
    /*
      Start the app
    */

    return app.listen(app.get('port'), app.get('host'), function() {
      return util.log(util.format('ENV: %s, listening on http://%s:%s', app.get('env'), app.get('host'), app.get('port')));
    });
  };

  /*
    Export app for some further use
  */


  startApp();

}).call(this);
