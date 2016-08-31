```
                           _
                          | |
 _ __ ___   __ _ _ __   __| |   ___ ___  _ __
| '_ ` _ \ / _` | '_ \ / _` |  / __/ _ \| '_ \
| | | | | | (_| | |_) | (_| | | (_| (_) | | | |
|_| |_| |_|\__,_| .__/ \__,_|  \___\___/|_| |_|
                | |
                |_|
```
A JavaScript library for connecting to a MapD GPU database and running queries.

## Documentation

The current `esdoc` generated documentation is outdated. For now, treat it as a rough guideline.

## Development Guidelines

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

By default, the callback signature of a Thrift client method is just `(response) =>`. This means that the response can either be the success response or a Thrift Exception.

Since this not idiomatic JS callback style, we wrap our Thrift client methods in `wrapWithErrorHandling`, making their signature `(error, response) =>`. Refer to `/src/mapd-client-v2` for examples of how to wrap Thrift client methods in the proper error handling style.

### Testing

Everything in MapdCon must be unit tested. You can find these tests in `/test-unit`.

The folders `/test` and `/test-functional` are deprecated.

### Linting

It's our eventual goal to fully lint the files in `mapd-con/src`. Try to write `libraries/mapd-con` using the `projects/dashboard-v2` Es6/7 style to make this goal easier to achieve.

## npm Scripts

Command | Description
--- | ---
`npm run fullbuild` | Lint, build, run tests, and generate documentation
`npm run lint` | Lint the source and tests against AirBnB style guide
`npm run build` | Runs `babel` and `webpack` scripts
`npm run babel` | Transpile to ES5 and output to build/ directory (usage: import/require statements)
`npm run webpack` | Generate webpack bundle and output to dist/ directory (usage: script tags)
`npm test:unit` | Runs mocha unit tests
`npm run watch` | Watches the `src/` directory for changes are runs `fullbuild` automatically
`npm run generate-docs` | Generates docs via esdoc
