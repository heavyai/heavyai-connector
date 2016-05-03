var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;
var MapdTypes = require('../../dist/node/mapd_types');
var mocks = require('../mocks/mocks-transpiled');
var viewLink = mocks.viewLink;

describe('#getLinkView', () => {
  var testViewAsync;

  it('should throw an error if not connected', () => {
    var con = new MapdCon();
    var getLinkView = _getLinkView.bind(this, con, viewLink, (error, view) => {
      // no-op
    });
    expect(getLinkView).toThrow('You are not connected to a server. Try running the connect method first.');
  });

  it('should throw an error without a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(con.getLinkView.bind(con, viewLink)).toThrow('You must specify a callback for the getLinkView method.');
      done();
    });
  });

  it('async - should get a frontend view by link', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      con.getLinkView(viewLink, (viewError, view) => {
        testViewAsync = view;
        expect(view).toBeA(MapdTypes.TFrontendView);
        done();
      });
    });
  });

  it('should contain a view_state', () => {
    expect(testViewAsync.view_state.length).toBeGreaterThan(0);
  });

  it('should contain a view_name property', () => {
    expect(testViewAsync.view_name).toEqual(viewLink);
  });
});

function _getLinkView(con, vL, cb) {
  con.getLinkView(vL, cb);
}
