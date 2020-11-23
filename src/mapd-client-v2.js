const MapDClient =
  (typeof window !== "undefined" && window.OmniSciClient) ||
  require("../build/thrift/node/OmniSci.js").Client // eslint-disable-line global-require

import { wrapWithErrorHandling } from "./wrap-with-error-handling"

export default function MapDClientV2(protocol) {
  MapDClient.call(this, protocol)
}

MapDClientV2.prototype = Object.create(MapDClient.prototype)

/* eslint-disable no-unused-expressions */
!(function () {
  ;[
    "connect",
    "sql_execute",
    "sql_execute_df",
    "sql_validate",
    "render",
    "render_vega",
    "get_result_row_for_pixel",
    "get_completion_hints",
    "get_tables",
    "get_table_details",
    "get_tables_meta",
    "get_fields",
    "get_status",
    "get_server_status",
    "get_hardware_info",
    "create_link",
    "get_link_view",
    "detect_column_types",
    "send_create_table",
    "send_import_table",
    "detect_column_types",
    "set_license_key",
    "get_license_claims"
  ].forEach((funcName) => {
    MapDClientV2.prototype[funcName] = function (...args) {
      return wrapWithErrorHandling(this, funcName)(...args)
    }
  })
})()
