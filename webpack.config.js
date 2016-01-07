module.exports = {
    entry: "./src/mapd-con-es6.js",
    output: {
        path: __dirname,
        filename: "mapd-con.js"
    },
    module: {
      loaders: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
      ]
    }
};
