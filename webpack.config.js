var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var VueLoaderPlugin = require('vue-loader/lib/plugin');

var dir_js = path.resolve(__dirname, 'frontend_js');
var dir_back_js = path.resolve(__dirname, 'backend_js');
var dir_html = path.resolve(__dirname, 'html');
var dir_build = path.resolve(__dirname, 'build');
var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    entry: path.resolve(dir_js, 'main.js'),
    resolve: {
        // root: __dirname + '/html',
        // modulesDirectories: ['node_modules'],
        // extensions: ['.js'],
        alias: {
            'vue$': 'vue/dist/vue.js'
        },
    },
    module: {
        rules: [
            { test: /\.js$/, use: 'babel-loader' },
            { test: /\.vue$/, use: 'vue-loader' },
            { test: /\.css$/, include: path.resolve(__dirname, 'css'), use: ['vue-style-loader', 'style-loader', 'css-loader', 'postcss-loader']},
        ]
      },
    output: {
        path: dir_build,
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: dir_build
    },
    devtool: 'source-map',
    plugins: [
        new VueLoaderPlugin(),
        new CopyWebpackPlugin({
            patterns: [{ from: dir_html, to: dir_build }]
        }),
    ],
    stats: {
        colors: true
    },
};
