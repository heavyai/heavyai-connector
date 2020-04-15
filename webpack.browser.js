const path = require("path")

module.exports = {
  ecmaFeatures: {modules: true},
  entry: [
    "script!./build/thrift/browser/thrift.js",
    "script!./build/thrift/browser/common_types.js",
    "script!./build/thrift/browser/serialized_result_set_types.js",
    "script!./build/thrift/browser/omnisci_types.js",
    "script!./build/thrift/browser/OmniSci.js",
    "script!./build/thrift/browser/completion_hints_types.js",
    "./src/mapd-con-es6.js"
  ],
  module: {
    loaders: [
      {test: /\.js$/, loader: "babel-loader", exclude: /node_modules/}
    ]
  },
  node: {
    child_process: "empty",
    fs: "empty",
    net: "empty",
    tls: "empty"
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "browser-connector.js"
  }
}
