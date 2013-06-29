hexo.on('ready', function(){
    // dotJSRendered - используем для установки global variables (env, pkgVersion)
    var dotJSRenderer = require('hexo-renderer-dotjs');

    // package.json settings
    var pkg = require('../../package.json');

    dotJSRenderer.setGlobals({
       pkgVer: pkg.version,
       env: process.env.NODE_ENV || "production"
    });
});