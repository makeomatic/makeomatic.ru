/*
  Dependencies
*/


(function() {
  var app, async, conf, dot, express, i18n, oneDay, pkg, root, startApp, util, _;

  express = require('express');

  dot = require('express-dot');

  async = require('async');

  _ = require('lodash');

  conf = require('./conf');

  util = require('util');

  pkg = require('../package.json');

  i18n = require("i18n");

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
    var blogEN, blogRU;

    i18n.configure({
      locales: ["ru", "en"],
      directory: "" + __dirname + "/../locales"
    });
    blogRU = express["static"]("" + root + "/../blog/public");
    blogEN = express["static"]("" + root + "/../blog_en/public");
    app.configure(function() {
      app.set('env', process.env.NODE_ENV || 'development');
      app.engine('dot', dot.__express);
      app.set('views', "" + root + "/views");
      app.set('view engine', 'dot');
      app.use(express.compress());
      app.use(express["static"]("" + root + "/../static/icons", {
        maxAge: 14 * oneDay
      }));
      app.use(express["static"]("" + root + "/../static", {
        maxAge: 365 * oneDay
      }));
      app.use(express.limit('10mb'));
      app.use(express.bodyParser());
      app.use(i18n.init);
      app.use(function(req, res, next) {
        var locale;

        locale = req.subdomains[0];
        if (locale !== 'ru') {
          locale = 'en';
        }
        i18n.setLocale(req, locale);
        return next();
      });
      app.use('/blog/', function(req, res, next) {
        var func;

        if (req.locale === "ru") {
          func = blogRU;
        } else {
          func = blogEN;
        }
        return func(req, res, next);
      });
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
