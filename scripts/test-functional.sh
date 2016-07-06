node_modules/.bin/babel ./test-functional/mocks/mocks.js -o ./test-functional/mocks/mocks-transpiled.js 
node_modules/.bin/babel ./test-functional/utils/utils.js -o ./test-functional/utils/utils-transpiled.js 
node_modules/.bin/mocha ./test-functional/browser.js --opts ./test-functional/mocha-browser.opts
