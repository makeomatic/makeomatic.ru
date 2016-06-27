## modules
_ = require 'lodash'

## data
{
  employees,
  main_page_title,
  portfolio,
  links,
  phone,
  email,
  copyright,
  address,
  tech,
  team_page_title,
  portfolio_page_title,
  description,
  team_description,
  portfolio_description,
} = require '../conf'

basic_data = {phone, email, copyright, address}

## export
module.exports =
  ###
    Homepage context generation
  ###
  homepage: (req, res) ->
    # mark second link as active
    homepage_links = _.clone links, true
    homepage_links[1].isActive = true
    # set data
    data = _.extend {isMain: true, links: homepage_links, description}, basic_data, {title: main_page_title, employees, portfolio, tech}
    data.__ = res.__
    data.originalUrl = req.originalUrl
    data.language = req.locale

    # send response
    res.render 'index', data

  ###
    Team context generation
  ###
  team: (req, res) ->
    # mark second link as active
    team_links = _.clone links, true
    team_links[0].isActive = true
    # set data
    data = _.extend {isTeam: true, links: team_links, description: team_description}, basic_data, {title: team_page_title, employees}
    data.__ = res.__
    data.originalUrl = req.originalUrl
    data.language = req.locale

    # send response
    res.render 'team', data

  ###
    Portfolio context generation
  ###
  portfoliopage: (req, res) ->
    portfolio_links = _.clone links, true
    portfolio_links[2].isActive = true
    # set data
    data = _.extend { isPortfolio: true, links: portfolio_links, description: portfolio_description },
      basic_data, { title: portfolio_page_title, portfolio }

    data.__ = res.__
    data.originalUrl = req.originalUrl
    data.language = req.locale

    # send response
    res.render 'portfolio', data
