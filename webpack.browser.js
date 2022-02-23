const path = require("path")
const webpack = require("webpack")

module.exports = {
  entry: ["./src/heavy-con-es6.js"],
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"]
    }),
    new webpack.DefinePlugin({
      "process.env": {
        BROWSER: JSON.stringify(true)
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader"
        },
        include: /src/
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
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
      name: {
        // commonjs: "@heavyai/connector",
        amd: "@heavyai/connector"
        // root: "DbCon"
      },
      type: "umd"
    },
    globalObject: "this",
    path: path.join(__dirname, "dist"),
    filename: "browser-connector.js"
  }
}
