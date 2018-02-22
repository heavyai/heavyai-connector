import fs from "fs"
import jsdom from "jsdom"

const scripts = `
  <script>
    ${fs.readFileSync("./thrift/browser/thrift.js", "utf-8")}
    ${fs.readFileSync("./thrift/browser/mapd.thrift.js", "utf-8")}
    ${fs.readFileSync("./thrift/browser/mapd_types.js", "utf-8")}
  </script>
`
const doc = jsdom.jsdom(`<!doctype html><html>${scripts}<body></body></html>`)
const win = doc.defaultView

global.document = doc
global.window = win

propagateToGlobal(win)

function propagateToGlobal(window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue
    if (key in global) continue
    global[key] = window[key]
  }
}
