# MapD Connector

A JavaScript library for connecting to a MapD GPU database and running queries.

### Table of Contents
- [Quick Start](#quick-start)
- [Example](#example)
- [Testing](#testing)
- [Scripts](#scripts)
- [Documentation](http://mapd.github.io/mapd-connector/docs/)
- [Contributing](.github/CONTRIBUTING.md)
- [License](LICENSE)

# Quick Start
```bash
yarn
npm run build
npm run docs # opens API docs in your browser.
```

# Example

Open [example.html](example.html) in your browser for a basic query call.

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
