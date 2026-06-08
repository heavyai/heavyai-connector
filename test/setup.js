// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from "fs"
import { JSDOM } from "jsdom"

const dom = new JSDOM(`<!doctype html><html><body></body></html>`, {
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
    if (key.match(/^T\w+/) && window.hasOwnProperty(key) && !(key in global)) {
      global[key] = window[key]
    }
  }
}
//   }
// }
