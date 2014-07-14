module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        //Read the package.json (optional)
        pkg: grunt.file.readJSON('package.json'),

        // Metadata.
        meta: {
            basePath: '',
            srcPath: 'source/',
            deployPath: 'source/'
        },

        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> ',

        // Task configuration.
        jst: {
            compile: {
                options: {

                    //namespace: "templates",                 //Default: 'JST'
                    prettify: false,                        //Default: false|true
                    amdWrapper: false,                      //Default: false|true
                    templateSettings: {
                        evaluate: /\{\{#([\s\S]+?)\}\}/g,
                        interpolate: /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g,
                        escape: /\{\{\{([\s\S]+?)\}\}\}/g
                    },
                    processName: function(filename) {
                        //Shortens the file path for the template.
                        //return filename.slice(filename.indexOf("views"), filename.length);
                        return filename;
                    }
                },
                files: {
                    "<%= meta.deployPath %>jst/templates.js": ["<%= meta.srcPath %>views/**/*.html"]
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jst');

    // Default task.
    grunt.registerTask('default', ['jst']);

};
