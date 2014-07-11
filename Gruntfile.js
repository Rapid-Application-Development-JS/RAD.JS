module.exports = function (grunt) {

    var fileList = grunt.file.readJSON('bin/toolset.json').items;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat : {
            build: {
                options : {
                    process : function(src){
                        return src.replace(/exports.+/, '');
                    }
                },
                files: {
                    'separated_core/bin/tools.js': fileList
                }
            }
        },

        uglify: {
            build: {
                options: {
//                    sourceMap: 'separated_core/bin/<%= pkg.name %>.<%= pkg.version %>.min.map'
                },
                files: [
                    {dest : 'separated_core/bin/<%= pkg.name %>.<%= pkg.version %>.min.js', src : 'separated_core/bin/<%= pkg.name %>.<%= pkg.version %>.js' }
                ]
            },
            pack : {
                options : {
                    beautify: true
                },
                files: {
                    'separated_core/bin/tools.js': fileList.split(',')
                }
            }
        },
        copy : {
            main: {
                files: [
                    {expand: true, src: ['core/**/*.js'], dest: 'test1', filter: 'isFile'}
                ]
            }
        },
        pure_cjs: {
            rad : {
                options : {
                    exports : 'RAD'
                },
                files: [
                    {src: 'separated_core/entry.js', dest: 'separated_core/bin/prebuild.js'}
                ]
            },
            blanks : {
                files: [
                    {src: 'separated_core/bin/structure.js', dest: 'separated_core/bin/<%= pkg.name %>.<%= pkg.version %>.js'}
                ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-pure-cjs');

    grunt.registerTask('pack', ['concat:build']);

    grunt.registerTask('blanks', function(){
        var structure = grunt.file.readJSON('separated_core/bin/structure.json'),

        content = grunt.file.read('separated_core/tools.tpl', 'utf-8');
        content = grunt.template.process(content, {data : {arr : structure}});

        grunt.file.write('separated_core/bin/structure.js', content);
    });


    grunt.registerTask('dev', ['pure_cjs:rad', 'blanks', 'pure_cjs:blanks']);
    grunt.registerTask('release', ['pure_cjs:rad', 'blanks', 'pure_cjs:blanks', 'uglify:build']);
};