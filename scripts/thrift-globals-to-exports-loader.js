// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Webpack loader for Apache Thrift browser-globals style JS output (thrift --gen js).
 *
 * The Thrift 0.23+ compiler's --gen js mode assigns all types to implicit globals
 * (e.g. `TSourceType = {...}`) with no module.exports, which webpack cannot enumerate
 * for named imports or `export * from` re-exports.
 *
 * This loader:
 *
 *   1. Scans for top-level bare identifier assignments and appends explicit
 *      `exports.X = X` statements so webpack can resolve them as named exports.
 *
 *   2. Strips the bogus `.value` accessor from scalar protocol read calls in the
 *      generated code. The Thrift 0.23 JS code generator emits
 *      `input.readString().value`, `input.readBool().value`, `input.readI32().value`,
 *      etc. — but the Apache Thrift 0.23 JS runtime's TBinaryProtocol / TJSONProtocol
 *      implementations of those scalar reads still return raw scalars, not
 *      `{ value: ... }` wrappers. The mismatch means every scalar field on every
 *      generated struct decodes to `undefined` (e.g. dashboard_name, dashboard_id,
 *      dashboard_metadata on TDashboard) so requests look "successful" but every
 *      row is blank. Stripping `.value` aligns the codegen with the runtime.
 *
 *      We only target the scalar reads that the generator actually emits with
 *      `.value`: readBinary, readBool, readDouble, readI16, readI32, readI64,
 *      readString, readUuid. Aggregate reads (readListBegin, readFieldBegin,
 *      readMessageBegin, ...) already return objects and are left untouched.
 *
 * If the source already contains module.exports (e.g. from --gen js:node output),
 * the file is returned unchanged.
 */
module.exports = function thriftGlobalsToExportsLoader(source) {
  // Already has module.exports - leave it alone (handles --gen js:node output)
  if (/\bmodule\.exports\b/.test(source)) {
    return source
  }

  // Strip the bogus `.value` accessor from scalar protocol read calls. See the
  // top-of-file comment for context.
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
