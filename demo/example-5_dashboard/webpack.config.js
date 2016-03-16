var webpack = require("webpack");
var Path = require('path');

module.exports = {
    entry: {
        app: "./src/app.js",
        vendors: [
            'expose?RAD!RAD',
            'jquery',
            'jquery-ui/sortable',
            'jquery-ui/autocomplete',
            'backbone',
            'expose?_!underscore'
        ]
    },
    devtool: 'source-map',
    output: {
        path: __dirname + '/build',
        filename: "app.js",
        sourceMapFilename: '[file].map'
    },
    resolve: {
        alias: {
            'RAD': Path.join(__dirname, '../..', 'build', 'rad')
        }
    },
    module: {
        loaders: [
            {
                test: /\.ejs$/,
                loader: "raw-loader"
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendors",
            filename: "vendors.js"
        }),
        new webpack.optimize.UglifyJsPlugin({ output: {comments: false} })
    ]
};