(function() {
  module.exports = function(req, res, next) {
    var ua, url;
    url = req.url;
    ua = req.headers['user-agent'];
    if (ua && ua.indexOf('MSIE') > -1) {
      res.setHeader('X-UA-Compatible', 'IE=Edge,chrome=1');
    }
    return next();
  };

}).call(this);
