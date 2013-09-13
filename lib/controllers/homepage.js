(function() {
  var address, basic_data, copyright, description, email, employees, links, main_page_title, phone, portfolio, team_description, team_page_title, tech, _, _ref;

  _ = require('lodash');

  _ref = require('../conf'), employees = _ref.employees, main_page_title = _ref.main_page_title, portfolio = _ref.portfolio, links = _ref.links, phone = _ref.phone, email = _ref.email, copyright = _ref.copyright, address = _ref.address, tech = _ref.tech, team_page_title = _ref.team_page_title, description = _ref.description, team_description = _ref.team_description;

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
      return res.render('team', data);
    }
  };

}).call(this);
