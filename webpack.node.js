const path = require("path")
module.exports = {
  ecmaFeatures: {modules: true},
  entry: [
    "./node_modules/thrift/lib/nodejs/lib/thrift/index.js",
    "./build/thrift/node/mapd_types.js",
    "./build/thrift/node/mapd.thrift.js",
    "./build/thrift/node/completion_hints_types.js",
    "./src/mapd-con-es6.js"
  ],
  module: {
    loaders: [
      {test: /\.js$/, loader: "babel-loader", exclude: /node_modules/}
    ]
  },
  output: {
    path: path.join(__dirname, "dist"),
    libraryTarget: "commonjs2",
    filename: "node-connector.js"
  },
  target: "node"
}
