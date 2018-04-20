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
    "sql_execute",
    "sql_validate",
    "render",
    "render_vega",
    "delete_frontend_view",
    "get_tables",
    "get_tables_meta",
    "get_frontend_views",
    "get_frontend_view",
    "create_link",
    "create_frontend_view"
  ]

  it("should have the correct methods on its prototype", () => {
    expect(methods.reduce(isMapDClientV2Method, true)).to.equal(true)
  })
})
