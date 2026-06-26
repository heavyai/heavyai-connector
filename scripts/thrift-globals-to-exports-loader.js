// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Webpack loader for Apache Thrift browser-globals style JS output (thrift --gen js).
 *
 * The Thrift 0.23+ compiler's --gen js mode assigns all types to implicit globals
 * (e.g. `TSourceType = {...}`) with no module.exports, which webpack cannot enumerate
 * for named imports or `export * from` re-exports.
 *
 * This loader scans for top-level bare identifier assignments and appends explicit
 * `exports.X = X` statements so webpack can resolve them as named exports.
 *
 * If the source already contains module.exports (e.g. from --gen js:node output),
 * the file is returned unchanged.
 */
module.exports = function thriftGlobalsToExportsLoader(source) {
  // Already has module.exports - leave it alone (handles --gen js:node output)
  if (/\bmodule\.exports\b/.test(source)) {
    return source
  }

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

  // Find all top-level bare identifier assignments: lines that start (no leading
  // whitespace) with an identifier followed by `=`. This matches enums and
  // constructor functions that thrift --gen js emits as implicit globals, e.g.:
  //   TSourceType = { 'DELIMITED_FILE': 0, ... }
  //   HeavyClient = function(input, output) { ... }
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
