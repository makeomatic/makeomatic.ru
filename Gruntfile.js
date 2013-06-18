module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
                    'static/css/app.min.<%= pkg.version %>.css': ['static/css/vendor/bootstrap.css', 'static/css/vendor/fineuploader-3.6.3.css', 'static/css/app.css']
                }
            }
        },
        uglify: {
          production: {
              options: {
                  mangle: {
                      except: ["jQuery","qq"]
                  }
              },
              files: {
                  'static/js/app.min.<%= pkg.version %>.js' : ['static/js/vendor/jquery-1.10.1.min.js',
                                            'static/js/vendor/bootstrap.min.js',
                                            'static/js/vendor/jquery.transit.min.js',
                                            'static/js/vendor/jquery.maskedinput.min.js',
                                            'static/js/vendor/jquery.fineuploader-3.6.3.min.js',
                                            'static/js/vender/isMobile.js',
                                            'static/js/app.js'
                                            ]
              }
          }
        },
        clean: {
            production: ["lib"]
        },
        imagemin: {
          production: {
              options: {
                optimizationLevel: 3
              },
              files: [{
                  expand: true,
                  cwd: 'img_source/',
                  src: ['**/*.png'],
                  dest: 'static/img',
                  ext: '.png'
              }]
          }
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
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-contrib-imagemin');



    // Default task.
    grunt.registerTask('default', ['less']);
    grunt.registerTask('production', ['clean', 'copy', 'coffee', 'less', 'cssmin', 'uglify']);

};