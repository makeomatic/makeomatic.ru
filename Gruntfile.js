module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        less: {
            development: {
                files: {
                    "static/css/app.css" : ["source/less/app.less"]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');

    // Default task.
    grunt.registerTask('default', ['less']);

};