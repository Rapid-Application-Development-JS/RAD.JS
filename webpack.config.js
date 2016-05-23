"use strict";

var Path = require('path');
var rootDir = __dirname;

var buildPath = Path.join(rootDir, 'build');
var buildName = 'rad.js';

function getPath(url) {
    return  Path.join(rootDir, 'src', url);
}

module.exports = {
    entry: getPath('rad.js'),
    devtool: 'source-map',
    output: {
        libraryTarget: "umd",
        library: "RAD",
        path: buildPath,
        filename: buildName,
        sourceMapFilename: '[file].map'
    },
    node: {
        __filename: true
    },
    // Define global variable names that could be required from RAD modules
    externals: {
        'backbone': {
            root: 'Backbone',
            commonjs2: 'backbone',
            commonjs: 'backbone',
            amd: 'backbone'
        },
        'underscore': {
            root: '_',
            commonjs2: 'underscore',
            commonjs: 'underscore',
            amd: 'underscore'
        }
    }
};