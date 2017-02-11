
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
})
