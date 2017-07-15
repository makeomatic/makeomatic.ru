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
                    'static/css/app.min.<%= pkg.version %>.css': ['static/css/vendor/bootstrap.css','static/css/vendor/font-awesome.css','static/css/vendor/fineuploader-3.6.3.css', 'static/css/app.css']
                }
            }
        },
        uglify: {
          production: {
              options: {
                  mangle: {
                      reserved: ["jQuery","qq"]
                  }
              },
              files: {
                  'static/js/app.min.<%= pkg.version %>.js' : ['static/js/vendor/jquery-1.10.1.min.js',
                                            'static/js/vendor/bootstrap.min.js',
                                            'static/js/vendor/jquery.transit.min.js',
                                            'static/js/vendor/jquery.maskedinput.min.js',
                                            'static/js/vendor/jquery.fineuploader-3.6.3.min.js',
                                            'static/js/vendor/gallery.js',
                                            'static/js/vendor/isMobile.js',
                                            'static/js/app.js'
                                            ]
              }
          }
        },
        clean: {
            production: ["lib"],
            blog: ["blog/public", "blog/db.json"]
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
                  extDot: 'last'
              }]
          }
        },
        release: {
            options: {
                npm : false
            }
        },
        shell: {
            hexo: {
                command: "cd blog && ../node_modules/.bin/hexo generate",
                options: {
                    stdout: true,
                    stderr: true
                }
            },
            hexo_en: {
                command: "cd blog_en && ../node_modules/.bin/hexo generate",
                options: {
                    stdout: true,
                    stderr: true
                }
            }
        },
        watch: {
            blog: {
                files: ['theme-makeomatic/**','blog/scaffolds/**','blog/scripts/**', 'blog/**/*.yml', "blog/source/_posts/**"],
                tasks: ['clean:blog', 'shell:hexo'],
                options: {
                    livereload: true
                }
            },
            less: {
                files: ['source/less/**'],
                tasks: ['less', 'cssmin'],
                options: {
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-contrib-imagemin');



    // Default task.
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('production', ['clean:production', 'copy', 'coffee', 'less', 'cssmin', 'uglify', 'shell']);

};
