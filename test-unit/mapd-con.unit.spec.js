
import chai, {expect} from "chai"


describe("MapdCon", () => {
  let mapdcon
  before(() => {
    mapdcon = require("../src/mapd-con-es6").default
    mapdcon._sessionId = "SESSION_ID"
  })
  function stubClient (client) {
    mapdcon._client = [client]
  }
  describe("getFrontendViewsAsync", () => {
    const views = [{}, {}, {}]
    before(() => {
      stubClient({
        get_frontend_views(id, cb) {
          cb(null, views)
        }
      })
    })
    it('should return a promise that resolves to the views results', function(done) {
      return mapdcon.getFrontendViewsAsync().then((result) => {
        expect(result).to.deep.equal(views)
        done()
      })
    })

  })

  describe("logging", () => {
    it('logging should return true', function() {
      mapdcon.logging(true)
      expect(mapdcon.logging()).to.deep.equal(true)
    })

  })

  describe("convertFromThriftTypes", () => {
    it("converts trift types to readable types", () => {
        const thriftType = {
          arrtime: {
            col_name: "arrtime",
            col_type: {
              comp_param: 0,
              encoding: 0,
              is_array: false,
              nullable: true,
              precision: 0,
              scale: 0,
              type: 0
            }
          }
        }

      expect(mapdcon.convertFromThriftTypes(thriftType)).to.deep.equal([
        {
          name: 'arrtime',
          type: 'SMALLINT',
          is_array: false,
          is_dict: false
        }
      ])
    })
  })
})
