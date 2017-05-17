module.exports = function (grunt) {
    grunt.initConfig({
        //tasks configuartion 
        concat: {
            vendor: {
                options: {
                    separator: ';'
                },
                src: [
                    'app/bower_components/angular/angular.js',
                    'app/bower_components/angular-ui-router/release/angular-ui-router.js',
                    'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
                    'app/bower_components/angular-growl-v2/build/angular-growl.js',
                    'app/bower_components/kjur-jsrsasign/jsrsasign-all-min.js',
                    'app/bower_components/comapi-sdk-js-foundation/dist/comapi-foundation.js',
                ],
                dest: 'app/build/vendorBundle.js'
            },
            app: {
                options: {
                    separator: ';'
                },
                src: [
                    'app/src/**/*.js',
                ],
                dest: 'app/build/appBundle.js'
            },
        },
        uglify: {
            options: {
                mangle: true
            },
            vendor: {
                files: {
                    'app/build/vendorBundle.min.js': ['app/build/vendorBundle.js']
                }
            },
            app: {
                files: {
                    'app/build/appBundle.min.js': ['app/build/appBundle.js'],
                }
            }
        },
        watch: {
            js: {
                files: ['app/src/**/*.*'],
                tasks: ['concat:app', 'uglify:app'],
                options: {
                    livereload: true,
                }
            },
        }
    });
    //loadNpmTasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    //define custom tasks
    grunt.registerTask('default', ['watch']);


    grunt.registerTask('build', [
        'concat:vendor',
        'concat:app',
        'uglify:vendor',
        'uglify:app',
    ]);

};