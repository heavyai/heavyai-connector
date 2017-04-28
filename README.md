# MapD Connector

A JavaScript library for connecting to a MapD GPU database and running queries.

### Table of Contents
- [Quick Start](#quick-start)
- [Synopsis](#synopsis)
- [Installation](#installation)
- [Examples](#examples)
- [Testing](#testing)
- [Documentation](#documentation)
- [Contributing](.github/CONTRIBUTING.md)
- [License](LICENSE.md)

# Quick Start
```bash
npm run clean
yarn
npm run build
npm run docs # opens API docs in your browser.
```

# Installation
```bash
npm install
npm run build
```

# Examples
Open [example.html](example.html) in your browser for a basic query call.

### Use Asynchronous Methods

Asynchronous Thrift client methods must always be used. Synchronous methods are deprecated and cause a bad user experience.

To ensure that the asynchronous version of the method is called, simply pass in a callback.

```js
// Bad
try {
  const response = client.query(query, options)
} catch (e) {
  throw e
}

// Good
client.query(query, options, (error, response) => {
  if (error) {
    callback(error)
  }  else {
    callback(null, response)
  }
})
```

You can even go one step further and wrap this in a Promise.

```js
// better
new Promise ((resolve, reject) => {
  client.query(query, options, (error, response) => {
    if (error) {
      reject(error)
    }  else {
      resolve(response)
    }
  })
})
```

### Error Handling

By default, the callback signature of a Thrift client method is `response => {…}`. This means that the response can either be the success response or a Thrift Exception.

Since this not idiomatic JS callback style, we wrap our Thrift client methods in `wrapWithErrorHandling`, making their signature `(error, response) =>`. Refer to `/src/mapd-client-v2` for examples of how to wrap Thrift client methods in the proper error handling style.

# Testing

Everything in MapdCon should be unit-tested and linted. You can find these tests in `/test`.

The linter and all tests run on
```bash
npm test
```

### Linting

It's our eventual goal to fully lint the files in `mapd-con/src`. Try to write `libraries/mapd-con` using the `projects/dashboard-v2` Es6/7 style to make this goal easier to achieve.

## npm Scripts

Command | Description
--- | ---
`npm run build` | Creates `/dist` folder and runs `webpack` script
`npm run clean` | Removes node modules, dist, and docs
`npm run docs` | Creates and opens docs
`npm run lint` | Runs lint
`npm run test` | Runs linting and unit tests
`npm run test:unit` | Runs mocha unit tests
