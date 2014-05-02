hexo.on('ready', function(){
    // dotJSRendered - используем для установки global variables (env, pkgVersion)
    var dotJSRenderer = require('hexo-renderer-dotjs');

    // package.json settings
    var pkg = require('../../package.json');
    var enLocale = require('../../locales/en.json');

    // load main site config file
    var config = require('../../lib/conf.js');

    // ставим линк блога как активный
    config.links[0].isActive = true;

    config.links.forEach(function(link){
        link.name = enLocale[link.name];
        link.children && link.children.forEach(function(child){
            child.name = enLocale[child.name];
        });
    });

    config.employees.forEach(function(employee){
        ["name", "occupation", "brief_description", "description", "status"].forEach(function(key){
            employee[key] = enLocale[employee[key]];
        });
    });

    config.address = enLocale[config.address];
    config.copyright = enLocale[config.copyright];

    dotJSRenderer.setGlobals({
       pkgVer: pkg.version,
       env: process.env.NODE_ENV || "production",
       makeomatic_config: config
    });
});