module.exports = function (grunt) {

    var fileList = grunt.file.readJSON('bin/toolset.json').items;

    fileList = fileList ? fileList : [];

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
                    'separated_core/bin/tools.js': fileList
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
                    {src: 'entry.js', dest: 'bin/prebuild.js'}
                ]
            },
            blanks : {
                files: [
                    {src: 'bin/structure.js', dest: 'bin/<%= pkg.name %>.js'}
                ]
            }
        },
        clean : {
            dev : {
                files : [
                    { src : ['bin/structure.js', 'bin/prebuild.js'] }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-pure-cjs');

    grunt.registerTask('pack', ['concat:build']);

    grunt.registerTask('blanks', function(){
        var structure = grunt.file.readJSON('bin/structure.json'),

        content = grunt.file.read('tools.tpl', 'utf-8');
        content = grunt.template.process(content, {data : {arr : structure}});

        grunt.file.write('bin/structure.js', content);
    });


    grunt.registerTask('dev', ['pure_cjs:rad', 'blanks', 'pure_cjs:blanks', 'clean:dev']);
    grunt.registerTask('release', ['pure_cjs:rad', 'blanks', 'pure_cjs:blanks', 'uglify:build']);
};