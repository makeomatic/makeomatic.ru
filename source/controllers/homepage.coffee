{employees, main_page_title} = require '../conf'

module.exports =
  ###
    Homepage context generation
  ###
  homepage: (req,res)->
    res.render 'index', {title: main_page_title, employees}