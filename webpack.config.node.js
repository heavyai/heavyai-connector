var path = require('path');
module.exports = {
    entry: [
      path.join(__dirname, 'Build', 'MapdConNode.js')
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        libraryTarget: 'commonjs2',
        filename: 'MapdConNode.js'
    },
    target: 'node'
};
