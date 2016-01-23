module.exports = {
    entry: [
      "./src/mapd-con-es6.js"
    ],
    output: {
        path: __dirname,
        filename: "mapd-con.js"
    },
    module: { 
      preLoaders: [
        {test: /\mapd-con-es6.js$/, loaders: ["eslint-loader"], exclude: /node_modules/}
      ],
      loaders: [
        {test: /\.js$/, loader: "babel-loader", exclude: /node_modules/}
      ]
    },
    ecmaFeatures: { modules: true }
};
