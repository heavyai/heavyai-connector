const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'eval-source-map',
  entry: './src/mapd-con-es6.js',

  output: {
    path: path.resolve(__dirname, 'dist', 'node'),
    filename: 'omniscidb-connector.js',
    library: 'omnisci',
    libraryTarget: 'umd'
  },

  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],

  resolve: {
    alias: {
      url: require.resolve("url/"),
      util: require.resolve("util/"),
      buffer: require.resolve("buffer/"),
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
      // The following two objs fix an issue with Apache-Arrow
      // As the package includes both .mjs and .js outputs, webpack errors
      // without this.
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }
    ]
  },

  optimization: {
    minimizer: [new TerserPlugin()]
  },

  target: 'node'
}