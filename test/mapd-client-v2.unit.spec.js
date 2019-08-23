import { expect } from "chai"
import MapDClientV2 from "../src/mapd-client-v2"

const _ = undefined
const MOCK_DATA = "MOCK_DATA"

function isMapDClientV2Method(truthValue, method) {
  return MapDClientV2.prototype.hasOwnProperty(method) && truthValue
}

function createMapDClientStub(methods) {
  const stub = function() {}
  methods.forEach(method => {
    stub.prototype[method] = (triggerError, cb) => {
      if (triggerError) {
        cb(new Error("Error"))
      } else {
        cb(MOCK_DATA)
      }
    }
  })
  return stub
}

describe("MapDClientV2", () => {
  const methods = [
    "connect",
    "sql_execute",
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
  ]

  it("should have the correct methods on its prototype", () => {
    expect(methods.reduce(isMapDClientV2Method, true)).to.equal(true)
  })
})
