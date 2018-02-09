// Karma configuration
// Generated on Mon May 15 2017 18:01:29 GMT-0700 (PDT)

module.exports = function(config) {
  const cfg = {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["mocha", "chai"],

    // list of files / patterns to load in the browser
    files: [
      "../node_modules/babel-polyfill/dist/polyfill.js", // for Promise in PhantomJS
      "../dist/browser-connector.js",
      "integration.spec.js"
    ],

    // list of files to exclude
    exclude: [],

    // test results reporter to use
    // possible values: "dots", "progress"
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["dots"],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ["PhantomJS"],
    // browsers: ["Chrome"],
    // customLaunchers: {
    //   Chrome_travis_ci: {
    //     base: "Chrome",
    //     flags: ["--no-sandbox"]
    //   }
    // },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "*.js": ["webpack"]
    },
    webpack: {
      module: {
        loaders: [
          {
            test: /\.js$/,
            loader: "babel-loader",
            exclude: /node_modules/,
            query: { presets: ["es2015"] }
          }
        ]
      }
    }
  }

  // if (process.env.TRAVIS) {
  //   config.browsers = ["Chrome_travis_ci"]
  // }

  config.set(cfg)
}
