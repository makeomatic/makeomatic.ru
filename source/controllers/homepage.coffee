## modules
_ = require 'lodash'

## data
{employees, main_page_title, portfolio, links, phone, email, copyright, address, tech, team_page_title} = require '../conf'

basic_data = {phone, email, copyright, address}

## export
module.exports =
  ###
    Homepage context generation
  ###
  homepage: (req,res)->
    # mark second link as active
    homepage_links = _.clone links, true
    homepage_links[1].isActive = true
    # set data

    console.log require('util').inspect(homepage_links, {depth: null})

    data           = _.extend {isMain: true, links: homepage_links}, basic_data, {title: main_page_title, employees, portfolio, tech}
    # send response
    res.render 'index', data

  ###
    Team context generation
  ###
  team: (req, res)->
    # mark second link as active
    team_links = _.clone links, true
    team_links[0].isActive = true

    console.log require('util').inspect(team_links, {depth: null})
    # set data
    data = _.extend {isTeam: true, links: team_links}, basic_data, {title: team_page_title, employees}
    # send response
    res.render 'team', data