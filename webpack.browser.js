const path = require("path")
const webpack = require("webpack")

module.exports = {
  entry: [
    "script-loader!./build/thrift/browser/thrift.js",
    "script-loader!./build/thrift/browser/common_types.js",
    "script-loader!./build/thrift/browser/serialized_result_set_types.js",
    "script-loader!./build/thrift/browser/omnisci_types.js",
    "script-loader!./build/thrift/browser/OmniSci.js",
    "script-loader!./build/thrift/browser/completion_hints_types.js",
    "./src/mapd-con-es6.js",
    "./src/entry.browser.js"
  ],
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
    path: path.join(__dirname, "dist"),
    filename: "browser-connector.js"
  }
}
