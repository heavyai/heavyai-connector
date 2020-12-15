const path = require("path")

module.exports = {
  entry: [
    "./node_modules/thrift/lib/nodejs/lib/thrift/index.js",
    "./build/thrift/node/common_types.js",
    "./build/thrift/node/extension_functions_types.js",
    "./build/thrift/node/serialized_result_set_types.js",
    "./build/thrift/node/omnisci_types.js",
    "./build/thrift/node/OmniSci.js",
    "./build/thrift/node/completion_hints_types.js",
    "./src/mapd-con-es6.js"
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        include: /src/
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
        type: "javascript/auto"
      }
    ]
  },
  externalsPresets:{
    node: true
  },
  externals: { 'apache-arrow': 'commonjs2 apache-arrow' },
  optimization: {
    minimize: false
  },
  output: {
    path: path.join(__dirname, "dist"),
    libraryTarget: "commonjs2",
    filename: "node-connector.js"
  },
  target: "node"
}
