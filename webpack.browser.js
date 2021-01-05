const path = require("path")
const webpack = require("webpack")

module.exports = {
  entry: "./src/entry.browser.js",
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"]
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: ["babel-plugin-transform-inline-environment-variables"]
          }
        },
        include: /src/
      }
    ]
  },
  externals: {
    '@apache-arrow/es2015-umd': 'umd Arrow'
  },
  resolve: {
    fallback: {
      util: require.resolve("util/"),
      url: require.resolve("url/")
    }
  },
  optimization: {
    minimize: false
  },
  output: {
    libraryTarget: 'umd',
    path: path.join(__dirname, "dist"),
    filename: "browser-connector.js"
  }
}
