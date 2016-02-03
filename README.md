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
npm start
```

## npm Scripts

Command | Description
--- | ---
`npm start` | Lint src/ and test/, transpile to ES5 and create webpack bundle, run the tests, and generate the documentation
`npm run lint` | Lint the source and tests against AirBnB style guide
`npm run build` | Transpile to ES5 and output to build/ directory (usage: import/require statements)
`npm run dist` | Generate webpack bundle and output to dist/ directory (usage: script tags)
`npm run watch` | Watches the `src/` directory for changes are runs `npm start` automatically
`npm run generate-docs` | Generates docs via esdoc
`npm run test` | Runs mocha tests

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

