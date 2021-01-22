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
    "./src/mapd-con-es6.js"
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
  externals: {
    "apache-arrow": {
      commonjs: "apache-arrow",
      commonjs2: "apache-arrow",
      amd: "apache-arrow",
      root: "Arrow"
    }
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
    library: {
      commonjs: "@mapd/connector",
      amd: "@mapd/connector",
      root: "MapdCon"
    },
    libraryTarget: "umd",
    libraryExport: "default",
    path: path.join(__dirname, "dist"),
    filename: "browser-connector.js"
  }
}
