import fs from "fs"
import { JSDOM } from "jsdom"

const scripts = `
  <script>
    ${fs.readFileSync("./thrift/browser/thrift.js", "utf-8")}
    ${fs.readFileSync("./thrift/browser/OmniSci.js", "utf-8")}
    ${fs.readFileSync("./thrift/browser/omnisci_types.js", "utf-8")}
  </script>
`
const dom = new JSDOM(`<!doctype html><html>${scripts}<body></body></html>`, {
  runScripts: "dangerously"
})
const win = dom.window
const doc = dom.window.document

global.document = doc
global.window = win

propagateToGlobal(win)

function propagateToGlobal(window) {
  for (const key of Object.keys(window)) {
    // only add objs with T prefix (TCopyParams, etc)
    // to global.
    if (key.match(/^T\w+/)) {
      if (!window.hasOwnProperty(key)) continue
      if (key in global) continue
      global[key] = window[key]
    }
  }
}
//   }
// }
