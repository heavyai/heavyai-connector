# MapD Connector

A JavaScript library for connecting to an OmniSci GPU database and running
queries.

![alt text](https://cloud.githubusercontent.com/assets/2932405/25765834/e18ae5c2-31a3-11e7-9afc-989dcf42941c.png "Connector Example with a d3 rendered chart")

# Quick Start for Users

Install with `npm install @mapd/connector`. Then import `@mapd/connector` in
your JavaScript program. 

# Documentation
Visit our [API Docs](http://omnisci.github.io/mapd-connector/docs/)

There have been some potentially breaking changes in v6:
* Prior to v6, the browser version of connector would expose all of the thrift
  types on `window`. v6 will continue to do this if you import the script using
  a standard html `<script>` tag. But, if you are using a bundler or module
  system (such as webpack), that is no longer the case. These types will be
  exported instead (so you can, for example, `import { TPixel } from
  "@mapd/connector/dist/browser-connector"`)
* All of the `xAsync` functions return a Promise - that hasn't changed. The
  corresponding non-Async functions (ie, `query` vs `queryAsync`) now also
  return Promises. The callback argument on these non-Async versions is
  optional since you can just use `then` or `catch` or the Promise. It's
  impossible to run any function synchronously now, however. In other words, if
  you call `query` without a callback, it's going to run asynchronously and
  return a Promise.

# Example
Open
[example.html](https://omnisci.github.io/mapd-connector/examples/browser.html)
in your browser for a basic query call.

# Quick Start for Developers

```bash
npm ci
npm run build
npm run docs # opens API docs in your browser.
```

# Testing

Everything in MapdCon should be unit-tested and linted. You can find these
tests in `/test`.

The linter and all tests run on
```bash
npm test
```

### Linting

It's our eventual goal to fully lint the files in `mapd-con/src`. Try to write
`libraries/mapd-con` using the `projects/dashboard-v2` Es6/7 style to make this
goal easier to achieve.

## Scripts

Command | Description
--- | ---
`npm run build` | Creates `/dist` folder and runs `webpack` script
`npm run clean` | Removes node modules, dist, and docs
`npm run docs` | Creates and opens docs
`npm run lint` | Runs lint
`npm run test` | Runs linting and unit tests
`npm run test:unit` | Runs mocha unit tests

## Contributing

Interested in contributing? We'd love for you to help! Check out
[Contributing.MD](.github/CONTRIBUTING.md)
