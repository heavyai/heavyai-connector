const path = require("path")
const webpack = require("webpack")

module.exports = {
  entry: ["./src/heavy-con-es6.js"],
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
  target: "node",
  // Handle Node.js builtin modules (e.g. node:crypto)
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
      resource.request = resource.request.replace(/^node:/, "")
    })
  ],
  resolve: {
    fallback: {
      crypto: false
    }
  }
}
