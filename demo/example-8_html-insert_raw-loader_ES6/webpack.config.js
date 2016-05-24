var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: "./index.js",
    output: {
        path: __dirname + '/build',
        filename: "app.min.js"
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
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-class-properties']
                }
            },
            {
                test: /\.ejs$/,
                loader: "raw-loader"
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