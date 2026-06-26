// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const path = require("path")
const webpack = require("webpack")

module.exports = {
  entry: ["./src/heavy-con-es6.js"],
  plugins: [
    new webpack.ProvidePlugin({
      Thrift: ["thrift", "Thrift"]
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        include: /src/
      },
      {
        // Convert Thrift --gen js browser-globals output to named CJS exports.
        test: /\.js$/,
        use: require.resolve("./scripts/thrift-globals-to-exports-loader.js"),
        include: /thrift/
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
  externalsPresets: {
    node: true
  },
  externals: { "apache-arrow": "commonjs2 apache-arrow" },
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
