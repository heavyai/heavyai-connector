const path = require("path")

module.exports = {
    entry: [
      "./src/mapd-con-es6.js"
    ],
    output: {
        path: path.join(__dirname, "/dist/"),
        filename: "mapd-connector.js"
    },
    module: {
      loaders: [
        {test: /\.js$/, loader: "babel-loader", exclude: /node_modules/}
      ]
    },
    ecmaFeatures: { modules: true }
};
