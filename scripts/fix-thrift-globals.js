"use strict"
const fs = require("fs")

mkdirp("build/")
mkdirp("build/thrift/")
mkdirp("build/thrift/browser/")
mkdirp("build/thrift/node/")
function mkdirp (path) {
  if (!fs.existsSync(path)) { // eslint-disable-line no-sync
    fs.mkdirSync(path) // eslint-disable-line no-sync
  }
}

const findExports = /^([\w]+)( = )/gm
const filePathsBrowser = [
  "thrift/browser/completion_hints_types.js",
  "thrift/browser/mapd_types.js",
  "thrift/browser/mapd.thrift.js",
  "thrift/browser/thrift.js"
]
const filePathsNode = [
  "thrift/node/completion_hints_types.js",
  "thrift/node/mapd_types.js",
  "thrift/node/mapd.thrift.js"
]
filePathsBrowser.forEach(declareWith("window."))
filePathsNode.forEach(declareWith("var "))
function declareWith (declaration) {
  return function (filePath) {
    console.log("Fixing file: ", filePath) // eslint-disable-line no-console
    const content = fs.readFileSync(filePath, {encoding: "utf8"}) // eslint-disable-line no-sync
    let newContent = content.replace(findExports, declaration + "$1$2")
    newContent = (/^"use strict"/.test(newContent) ? newContent : "\"use strict\"\n" + newContent)
    if (filePath.includes("/thrift.js")) {
      newContent = newContent + "; window.Thrift = Thrift; "
    }
    fs.writeFileSync("build/" + filePath, newContent) // eslint-disable-line no-sync
    console.log("Fixed file: ", "build/" + filePath) // eslint-disable-line no-console
  }
}
