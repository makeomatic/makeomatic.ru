module.exports =
  ###
    Homepage context generation
  ###
  homepage: (req,res)->
    res.render 'index', {title: "Главная страница"}