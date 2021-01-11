const puppeteer = require("puppeteer")
process.env.CHROME_BIN = puppeteer.executablePath()

module.exports = function (config) {
  const cfg = {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "../",

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["mocha", "chai"],

    // list of files / patterns to load in the browser
    files: ["./dist/browser-connector.js", "test/integration.spec.js"],

    // list of files to exclude
    exclude: [],

    // test results reporter to use
    // possible values: "dots", "progress"
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["dots"],

    preprocessors: {
      "test/**/*.js": ["babel"]
    },

    babelPreprocessor: {
      options: {
        presets: ["@babel/preset-env"],
        plugins: ["transform-inline-environment-variables"],
        sourceMap: "inline"
      }
    },

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
    browsers: ["HeadlessChrome"],
    customLaunchers: {
      HeadlessChrome: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"]
      }
    },
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  }

  // if (process.env.TRAVIS) {
  //   config.browsers = ["Chrome_travis_ci"]
  // }

  config.set(cfg)
}
