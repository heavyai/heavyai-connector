module.exports = {
  "extends": ["eslint:recommended"],
  "env": {
    "es6": true,
    "browser": true,
    "node": true,
    "jasmine": true
  },
  "parser": "@babel/eslint-parser",
  "parserOptions": {
    "ecmaVersion": 6,
    "babelOptions": {
      "plugins": ['@babel/plugin-proposal-class-properties'],
    },
    "ecmaFeatures": {
      "arrowFunctions": true,
      "binaryLiterals": true,
      "blockBindings": true,
      "classes": true,
      "defaultParams": true,
      "destructuring": true,
      "forOf": true,
      "generators": true,
      "objectLiteralComputedProperties": true,
      "objectLiteralDuplicateProperties": true,
      "objectLiteralShorthandMethods": true,
      "objectLiteralShorthandProperties": true,
      "octalLiterals": true,
      "regexUFlag": true,
      "regexYFlag": true,
      "restParams": true,
      "spread": true,
      "superInFunctions": true,
      "templateStrings": true,
      "unicodeCodePointEscapes": true,
      "globalReturn": true,
      "experimentalObjectRestSpread": true
    },
    "sourceType": "module"
  },
}
