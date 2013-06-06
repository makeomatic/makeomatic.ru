module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        less: {
            development: {
                files: {
                    "static/css/app.css" : ["source/less/app.less"]
                }
            }
        },
        copy: {
            production: {
                files: [
                    {expand: true, cwd: 'source/views/', src: ["**"], dest: 'lib/views'}
                ]
            }
        },
        coffee: {
            production: {
                expand: true,
                flatten: false,
                cwd: 'source',
                src: ['**/*.coffee'],
                dest: 'lib',
                ext: '.js'
            }
        },
        cssmin: {
            compress: {
                files: {
                    'static/css/app.min.css': ['static/css/bootstrap.css', 'static/css/app.css']
                }
            }
        },
        clean: {
            production: ["lib"]
        },
        release: {
            options: {
                npm : false
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-release');



    // Default task.
    grunt.registerTask('default', ['less']);
    grunt.registerTask('production', ['clean', 'copy', 'coffee', 'less', 'cssmin']);

};