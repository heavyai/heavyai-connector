const path = require('path');
const webpack = require('webpack');

module.exports = {
    target: 'web',
    entry: './src/entry.browser.js',

    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
        filename: 'omniscidb-connector.js',
        library: 'omnisci',
        libraryTarget: 'umd'
    },

    // Several of the following config items are needed for shimming
    // node globals and other expected types when transpiling the thrift
    // bindings generated for nodejs.
    // ex: Buffer, url and util.
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
        })
    ],

    node: {
        global: true
    },

    resolve: {
        alias: {
            url: require.resolve("url/"),
            util: require.resolve("util/"),
            buffer: require.resolve("buffer/"),
            'thrift': require.resolve("thrift/lib/nodejs/lib/thrift/browser"),
            'gen-thrift': path.resolve(__dirname, "thrift/node/")
        }
    },

    module: {
        rules: [
            {
                // test: /\.m?js$/,
                test: /\.js$/,
                include: /src/,
                // exclude: [
                //     /\/node_modules\//,
                //     /\bcore-js\b/,
                //     /\bwebpack\/buildin\b/,
                //     /@babel\/runtime-corejs3/
                // ],
                loader: 'babel-loader'
            },
            {
                // The following is a fix for an issue with Apache-Arrow
                // As the include both .mjs and .js files, webpack errors
                // without this.
                test: /\.m?js$/,
            }
        ]
    },

}