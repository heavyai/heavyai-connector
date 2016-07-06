var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;
var mocks = require('../mocks/mocks-transpiled');
var MapdTypes = require('../../thrift/node/mapd_types');
var viewNameAsync = mocks.viewNameAsync;

describe('#getFrontendView', () => {
  var testViewAsync;
  it('should throw an error if not connected', () => {
    var con = new MapdCon();
    var getFrontendView = _getFrontendView.bind(this, con, viewNameAsync, (error, view) => {
      // no-op
    });
    expect(getFrontendView).toThrow('You are not connected to a server. Try running the connect method first.');
  });

  it('should throw an error without a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(con.getFrontendView.bind(con)).toThrow('You must specify a callback for the getFrontendView method.');
      done();
    });
  });

  it('async - should get a frontend view with the name "test_view_async"', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      con.getFrontendView(viewNameAsync, (viewError, view) => {
        testViewAsync = view;
        expect(view).toBeA(MapdTypes.TFrontendView);
        done();
      });
    });
  });

  it('should contain a view_state', () => {
    expect(testViewAsync.view_state.length).toBeGreaterThan(0);
  });

  it('should contain a valid view_name property', () => {
    expect(testViewAsync.view_name).toEqual(viewNameAsync);
  });

});

function _getFrontendView(con, vN, cb) {
  con.getFrontendView(vN, cb);
}
