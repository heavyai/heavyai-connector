node_modules/.bin/babel ./test/mocks/mocks.js -o ./test/mocks/mocks-transpiled.js 
node_modules/.bin/babel ./test/utils/utils.js -o ./test/utils/utils-transpiled.js 
node_modules/.bin/mocha ./test/browser.js --opts ./test/mocha-browser.opts
node_modules/.bin/mocha ./test/node.js --opts ./test/mocha-node.opts
