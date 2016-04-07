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

## Installation

```bash
git clone https://github.com/map-d/mapd-con.git
npm install
```

## Building MapdCon

- Rename `test/config.example.js` -> `test/config.js`
- Fill in your test server connection parameters in `test/config.js`
- Run `npm start`

## Getting Started

#### In the browser

Add the following scripts to your page:

```
<script src="dist/thrift.js"></script>
<script src="dist/mapd.thrift.js"></script>
<script src="dist/mapd_types.js"></script>
<script src="dist/MapdCon.js"></script>
```

**Asynchronous Usage:**

```
var query = "SELECT count(*) AS n FROM tweets WHERE country='CO'";

var conAsync = new MapdCon()
  .protocol("http")
  .host("myinstance.mapd.com")
  .port("8080")
  .dbName("mapd_twitter_data")
  .user("foo")
  .password("bar");

conAsync.connect(function(con){
  con.query(query, {}, [callback]);
  function callback(result){
    // result === [{"n":5730}]
  }
});
```

**Synchronous Usage:**
```
var query = "SELECT count(*) AS n FROM tweets WHERE country='CO'";

var con = new MapdCon()
  .protocol("http")
  .host("myinstance.mapd.com")
  .port("8080")
  .dbName("mapd_twitter_data")
  .user("foo")
  .password("bar")
  .connect();

var result = con.query(query, {});
// result === [{"n":5730}]
```

## npm Scripts

Command | Description
--- | ---
`npm run fullbuild` | Lint, build, run tests, and generate documentation
`npm run lint` | Lint the source and tests against AirBnB style guide
`npm run build` | Runs `babel` and `webpack` scripts 
`npm run babel` | Transpile to ES5 and output to build/ directory (usage: import/require statements)
`npm run webpack` | Generate webpack bundle and output to dist/ directory (usage: script tags)
`npm test` | Runs mocha tests
`npm run watch` | Watches the `src/` directory for changes are runs `fullbuild` automatically
`npm run generate-docs` | Generates docs via esdoc

## Pull Requests:

Attach the appropriate semvar label below to the **title of your pull request**. This allows Jenkins to publish to npm automatically.

Semvar Tag | Description
--- | ---
`[major]` | Breaking changes, api changes, moving files
`[minor]` | New features (additive only!)
`[patch]` | Bugfixes, documentation

Jenkins will not let you merge a pull request that contains a missing or multiple semvar label.

**Forgot to add a semvar label?**

1. Update the PR Title
2. Close the PR
3. Re-open it to force Jenkins to retest the new title.

