var cp = require('child_process');
var path = require("path");
var fs = require("fs");

var cmds = fs.readdirSync(__dirname).filter(function(dirname) {
    var dirPath = path.join(__dirname, dirname);
    var configPath = path.join(dirPath, 'webpack.config.js');
    var configExists = false;

    if (fs.statSync(dirPath).isDirectory()) {
        try {
            fs.statSync(configPath);
            configExists = true;
        } catch (e) {
            configExists = false;
        }
    }

    return configExists;
}).sort().map(function(dirname) {
    return "cd " + dirname.replace(/\s+/g, '\\ ') + " && webpack";
});

var stack = function() {
    console.log("done");
};

console.log("Building demo:");

for(var i = cmds.length-1; i >= 0; i--) {
    var cmd = cmds[i];
    stack = (function(next, cmd) {
        return function() {
            console.log('command', cmd);
            cp.exec(cmd, function(error, stdout, stderr) {
                if(error) console.error(error);
                else if(stderr) console.error(stderr), next();
                else next();
            });
        }
    }(stack, cmd));
}
stack();