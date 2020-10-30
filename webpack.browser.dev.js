const { merge } = require('webpack-merge');
const common = require('./webpack.browser.common.js');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
    mode: 'development',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.NODE_DEBUG': JSON.stringify('false')
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    optimization: {
        minimizer: [new TerserPlugin()]
    }
});