# MapD Connector

A JavaScript library for connecting to a MapD GPU database and running queries.


![alt text](https://cloud.githubusercontent.com/assets/2932405/25765834/e18ae5c2-31a3-11e7-9afc-989dcf42941c.png "Connector Example with a d3 rendered chart")

# Quick Start
```bash
yarn
npm run build
npm run docs # opens API docs in your browser.
```
# Documentation
Visit our [API Docs](http://omnisci.github.io/mapd-connector/docs/)

# Example

Open [example.html](https://omnisci.github.io/mapd-connector/examples/browser.html) in your browser for a basic query call.

# Testing

Everything in MapdCon should be unit-tested and linted. You can find these tests in `/test`.

The linter and all tests run on
```bash
npm test
```

### Linting

It's our eventual goal to fully lint the files in `mapd-con/src`. Try to write `libraries/mapd-con` using the `projects/dashboard-v2` Es6/7 style to make this goal easier to achieve.

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

Interested in contributing? We'd love for you to help! Check out [Contributing.MD](.github/CONTRIBUTING.md)
