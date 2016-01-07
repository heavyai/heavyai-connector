module.exports = {
    entry: "./mapd-con-es6.js",
    output: {
        path: __dirname,
        filename: "mapd-con-singleton-compiled.js"
    },
    module: {
      loaders: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
      ]
    }
};
