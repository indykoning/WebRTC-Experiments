var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

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

const common = {
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                test: /\.js?$/,
                exclude: /node_modules/,
                query: { presets: [ 'env' ] }
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css!sass')
            }
            ]
    },
    plugins: [
        // Simply copies the files over
        new CopyWebpackPlugin([
    { from: dir_html } // to: output.path
]),
    // Avoid publishing files when compilation fails
    new webpack.NoErrorsPlugin(),
    // Move generated styles into a dedicated file
    new ExtractTextPlugin('style.css', {
        allChunks: true
    })
],
stats: {
    // Nice colored output
    colors: true
},
// Create Sourcemaps for the bundle
devtool: 'source-map'
};


const frontend = {
    entry: path.resolve(dir_js, 'main.js'),
    resolve: {
        root: __dirname + '/js',
        modulesDirectories: ['node_modules'],
        extensions: ['', '.js']
    },
    output: {
        path: dir_build,
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: dir_build
    }
};

const backend = {
                    entry: path.resolve(dir_back_js, 'main.js'),
                    output: {
                            path: dir_build,
                            filename:'backend.js'
                    },
                    target: 'node',
                    externals: nodeModules
};

module.exports = [
    Object.assign({}, common, backend),
    Object.assign({}, common, frontend)

];