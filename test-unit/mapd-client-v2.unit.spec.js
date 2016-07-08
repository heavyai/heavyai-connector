import {expect} from "chai"
import MapDClientV2 from "../src/mapd-client-v2"

const _ = undefined
const MOCK_DATA = 'MOCK_DATA'

function isMapDClientV2Method (truthValue, method) {
  return MapDClientV2.prototype.hasOwnProperty(method) && truthValue
}

function createMapDClientStub (methods) {
  const stub = function(){}
  methods.forEach((method) => {
    stub.prototype[method] = (triggerError, cb) => {
      if (triggerError) {
        cb('error')
      } else {
        cb(MOCK_DATA)
      }
    }
  })
  return stub
}

describe("MapDClientV2", () => {
  const methods = [
    'sql_execute',
    'render',
    'delete_frontend_view',
    'get_tables',
    'get_frontend_views',
    'get_frontend_view',
    'create_link',
    'create_frontend_view'
  ]

  it("should have the correct methods on its prototype", () => {
    expect(methods.reduce(isMapDClientV2Method, true)).to.equal(true)
  })

  describe('methods', () => {
    let client
    let mapdclient
    before(() => {
      mapdclient = global.MapDClient
      global.MapDClient = createMapDClientStub(methods)
      client = new MapDClientV2()
    })
    after(() => {
      global.MapDClient = mapdclient
    })
    describe('sql_execute', () => {
      it('should return errors as a JS Error Object', function(done) {
        client.sql_execute(true, function(err, data) {
          expect(err instanceof Error).to.equal(true)
          done()
        })
      })
    })
  })
})
