mkdir -p build
../../node_modules/babel-cli/bin/babel.js ./src/mapd-con-es6.js -o ./build/MapdCon.js
../../node_modules/babel-cli/bin/babel.js ./src/mapd-client-v2.js -o ./build/mapd-client-v2.js
../../node_modules/babel-cli/bin/babel.js ./src/process-columnar-results.js -o ./build/process-columnar-results.js
../../node_modules/babel-cli/bin/babel.js ./src/process-row-results.js -o ./build/process-row-results.js
../../node_modules/babel-cli/bin/babel.js ./src/process-query-results.js -o ./build/process-query-results.js
../../node_modules/babel-cli/bin/babel.js ./src/mapd-con-node-support.js -o ./build/MapdConNode.js
../../node_modules/babel-cli/bin/babel.js ./src/utils.js -o ./build/MapdConUtils.js
