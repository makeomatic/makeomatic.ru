module.exports = ieEdgeChromeFrameHeader = ->
  return (req, res, next)->
    url   = req.url
    ua    = req.headers['user-agent']

    if ua and ua.indexOf('MSIE') > -1
      res.setHeader 'X-UA-Compatible', 'IE=Edge,chrome=1'

    next()
