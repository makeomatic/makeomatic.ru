hexo.on('ready', function(){

    global.hexo = hexo;

    // dotJSRendered - используем для установки global variables (env, pkgVersion)
    var dotJSRenderer = require('hexo-renderer-dotjs');

    // package.json settings
    var pkg = require('../../package.json');

    // load main site config file
    var config = require('../../lib/conf.js');

    // ставим линк блога как активный
    config.links[0].isActive = true;

    dotJSRenderer.setGlobals({
       pkgVer: pkg.version,
       env: process.env.NODE_ENV || "production",
       makeomatic_config: config
    });
});