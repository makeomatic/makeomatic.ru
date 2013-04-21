{employees, main_page_title, portfolio, links, phone, email, copyright, address, tech} = require '../conf'

module.exports =
  ###
    Homepage context generation
  ###
  homepage: (req,res)->
    res.render 'index', {title: main_page_title, employees, portfolio, links, phone, email, copyright, address, tech}