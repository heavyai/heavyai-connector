// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Adapts Thrift 0.23 browser-globals output into webpack-friendly exports and
// strips scalar `.value` reads that no longer match the JS runtime.
module.exports = function thriftGlobalsToExportsLoader(source) {
  // Already has module.exports - leave it alone (handles --gen js:node output)
  if (/\bmodule\.exports\b/.test(source)) {
    return source
  }

  // Scalar protocol reads already return raw values in thrift 0.23.
  // eslint-disable-next-line no-param-reassign
  source = source.replace(
    /(\.read(?:Binary|Bool|Double|I16|I32|I64|String|Uuid)\(\))\.value\b/g,
    "$1"
  )

  const fs = require("fs")
  const path = require("path")

  const findAssignedNames = (text) => {
    const names = []
    const seen = new Set()
    const re = /^([A-Za-z_$][A-Za-z0-9_$]*)\s*=/gm
    let m
    while ((m = re.exec(text)) !== null) {
      if (!seen.has(m[1])) {
        seen.add(m[1])
        names.push(m[1])
      }
    }
    return names
  }

  // Find enums and constructor functions emitted as top-level implicit globals.
  const names = findAssignedNames(source)

  if (names.length === 0) return source

  const thriftDir = path.dirname(this.resourcePath)
  const allNames = fs
    .readdirSync(thriftDir)
    .filter((fileName) => fileName.endsWith(".js"))
    .flatMap((fileName) =>
      findAssignedNames(fs.readFileSync(path.join(thriftDir, fileName), "utf8"))
    )
    .filter((name, index, all) => all.indexOf(name) === index)

  const declarations = allNames
    .map((n) => `var ${n} = globalThis.${n};`)
    .join("\n")
  const suffix =
    "\n// <thrift-globals-to-exports-loader>\n" +
    names
      .map(
        (n) =>
          `if (typeof ${n} !== 'undefined') { globalThis.${n} = ${n}; exports.${n} = ${n}; }`
      )
      .join("\n") +
    "\n"

  return declarations + "\n" + source + suffix
}
