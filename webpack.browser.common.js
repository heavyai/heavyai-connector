const path = require('path');
const webpack = require('webpack');

module.exports = {
    target: 'web',
    entry: './src/mapd-con-es6.js',

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
                test: /\.m?js$/,
                include: /src/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: ['@babel/plugin-proposal-class-properties'],
                        presets: ['@babel/preset-env']
                    }
                }
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