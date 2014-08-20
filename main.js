var exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path'),
    child;

var modes = ['dev', 'release'];

function build(mode, cb){

    if (modes.indexOf(mode) < 0){
        console.log('Incorrect mode specified');
        return false;
    }

    var structSource = path.join(__dirname, 'structure.json'),
        structDest = path.join(__dirname, '/bin/structure.json');

    try {
        var structure = fs.readFileSync(structSource);
        fs.writeFileSync(structDest, structure);
    } catch (e) {
        console.log(e);
    }

    child = exec('./node_modules/.bin/grunt ' + mode,
        { cwd : __dirname },
        function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);

            var fileName = 'rad.js',
                filePath='';

            if (error !== null) {
                console.log('exec error: ' + error);
            } else {
                filePath = path.resolve(path.join(__dirname, 'bin', fileName));
            }
            if (typeof cb == 'function'){
                cb(filePath);
            }

        });

}


function getLibsPath(){
    return path.join(__dirname, 'examples', 'libs');
}

function getCssPath(){
    return path.join(__dirname, 'css');
}

function getRADPath(){
    return path.join(__dirname, 'bin', 'rad.js');
}

exports.build = build;
exports.getLibsPath = getLibsPath;
exports.getCssPath = getCssPath;
exports.getRADPath = getRADPath;