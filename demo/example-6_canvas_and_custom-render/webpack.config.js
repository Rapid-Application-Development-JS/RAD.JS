var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    context: __dirname,
    node: {
        __filename: true,
        __dirname: true,
        process: true
    },
    entry: "./index.js",
    output: {
        path: __dirname + '/build',
        filename: "app.js"
    },

    // Define global variable names that could be required inside module
    externals: {
        "RAD": "RAD",
        "RAD.js": "RAD",
        "$": "jQuery",
        "jQuery": "jQuery",
        "Backbone": "Backbone",
        "underscore": "_",
        "_": "_",
        "iScroll": "iScroll",
        "FastClick": "FastClick"
    },
    resolve: {
        alias: {
            views: __dirname + '/source/views',
            source: __dirname + '/source'
        }
    },
    module: {
        loaders: [
            {
                test: /\.ejs$/,
                exclude: /node_modules/,
                loader: 'itemplate-loader',
                query: {
                    // pass itemplate option here
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("css-loader")
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({output: {comments: false}})
    ]
};