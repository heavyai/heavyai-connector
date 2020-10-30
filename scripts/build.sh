#!/bin/sh

node_modules/.bin/webpack --config ./webpack.browser.prod.js
node_modules/.bin/webpack --config ./webpack.node.js
