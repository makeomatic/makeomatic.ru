(function() {
  var _, address, basic_data, copyright, description, email, employees, links, main_page_title, phone, portfolio, portfolio_description, portfolio_page_title, ref, team_description, team_page_title, tech;

  _ = require('lodash');

  ref = require('../conf'), employees = ref.employees, main_page_title = ref.main_page_title, portfolio = ref.portfolio, links = ref.links, phone = ref.phone, email = ref.email, copyright = ref.copyright, address = ref.address, tech = ref.tech, team_page_title = ref.team_page_title, portfolio_page_title = ref.portfolio_page_title, description = ref.description, team_description = ref.team_description, portfolio_description = ref.portfolio_description;

  basic_data = {
    phone: phone,
    email: email,
    copyright: copyright,
    address: address
  };

  module.exports = {

    /*
      Homepage context generation
     */
    homepage: function(req, res) {
      var data, homepage_links;
      homepage_links = _.clone(links, true);
      homepage_links[1].isActive = true;
      data = _.extend({
        isMain: true,
        links: homepage_links,
        description: description
      }, basic_data, {
        title: main_page_title,
        employees: employees,
        portfolio: portfolio,
        tech: tech
      });
      data.__ = res.__;
      data.originalUrl = req.originalUrl;
      data.language = req.locale;
      return res.render('index', data);
    },

    /*
      Team context generation
     */
    team: function(req, res) {
      var data, team_links;
      team_links = _.clone(links, true);
      team_links[0].isActive = true;
      data = _.extend({
        isTeam: true,
        links: team_links,
        description: team_description
      }, basic_data, {
        title: team_page_title,
        employees: employees
      });
      data.__ = res.__;
      data.originalUrl = req.originalUrl;
      data.language = req.locale;
      return res.render('team', data);
    },

    /*
      Portfolio context generation
     */
    portfolioPage: function(req, res) {
      var data, portfolio_links;
      portfolio_links = _.clone(links, true);
      portfolio_links[2].isActive = true;
      data = _.extend({
        isPortfolio: true,
        links: portfolio_links,
        description: portfolio_description
      }, basic_data, {
        title: portfolio_page_title,
        portfolio: portfolio
      });
      data.__ = res.__;
      data.originalUrl = req.originalUrl;
      data.language = req.locale;
      return res.render('portfolio', data);
    }
  };

}).call(this);
