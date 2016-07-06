var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;

var mocks = require('../mocks/mocks-transpiled');
var viewNameAsync = mocks.viewNameAsync;
var viewState = utils.randomString(10);
var imageHash = utils.randomString(8, 'n');

describe('#createFrontendView', () => {
  it('should throw an error if not connected', () => {
    var con = new MapdCon();
    var createFrontendView = _createFrontendView.bind(this, con, viewNameAsync, viewState, imageHash, (error, created) => {
      // no-op
    });
    expect(createFrontendView).toThrow('You are not connected to a server. Try running the connect method first.');
  });

  it('should throw an error without a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(con.createFrontendView.bind(con)).toThrow('You must specify a callback for the createFrontendView method.');
      done();
    });
  });

  it('async - should create a new frontend view with the name "test_view"', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      con.createFrontendView(viewNameAsync, viewState, imageHash, (error, viewName) => {
        expect(viewName).toEqual(viewNameAsync);
        done();
      });
    });
  });
});

function _createFrontendView(con, vN, vS, iH, cb) {
  con.createFrontendView(vN, vS, iH, cb);
}
