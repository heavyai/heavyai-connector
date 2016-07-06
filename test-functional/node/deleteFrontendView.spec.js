var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;

var mocks = require('../mocks/mocks-transpiled');
var viewNameAsync = mocks.viewNameAsync;

describe('#deleteFrontendView', () => {
  it('should throw an error if not connected', () => {
    var con = new MapdCon();
    var deleteFrontendView = _deleteFrontendView.bind(this, con, viewNameAsync, (error, deleted) => {
      // no-op
    });
    expect(deleteFrontendView).toThrow('You are not connected to a server. Try running the connect method first.');
  });

  it('should throw an error without a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(con.deleteFrontendView).toThrow('You must specify a callback for the deleteFrontendView method.');
      done();
    });
  });

  it('async - should delete a frontend view with name "test_view_async"', (done) => {
    var con = new MapdCon();
    utils.connect(con, (sessionId) => {
      con.deleteFrontendView(viewNameAsync, (error, viewName) => {
        expect(viewName).toEqual(viewNameAsync);
        done();
      });
    });
  });
});

function _deleteFrontendView(con, vN, cb) {
  con.deleteFrontendView(vN, cb);
}
