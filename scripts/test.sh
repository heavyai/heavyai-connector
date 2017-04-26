node_modules/.bin/eslint --config .eslintrc.json --fix src/ && \
istanbul cover _mocha -- ./test --require ./test/config.js --require ./test/setup.js
