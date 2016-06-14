var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;
var MapdTypes = require('../../thrift/node/mapd_types');

describe('#getFrontendViews', () => {
  it('should throw an error if not connected', () => {
    var con = new MapdCon();
    try {
      con.getFrontendViews((viewsError, views) => {
        // no-op
      });
    } catch (e) {
      expect(e.message).toEqual('You are not connected to a server. Try running the connect method first.');
    }
  });

  it('should throw an error without a callback', () => {
      var con = new MapdCon();
      var result;
      try {
        result = con.getFrontendViews();
      } catch (e) {
        expect(e.message).toEqual('You must specify a callback for the getFrontendViews method.');
      }
  });

  it('async - should get an array of frontend views with a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      con.getFrontendViews((viewsError, views) => {
        expect(viewsError).toEqual(null);
        views.forEach((view) => {
          expect(view).toBeA(MapdTypes.TFrontendView);
        });
        done();
      });
    });
  });

  it('should contain an empty string view state for each view in the array', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      con.getFrontendViews((viewsError, views) => {
        views.forEach((view) => {
          expect(view.view_state).toEqual('');
        });
        done();
      });
    });
  });

  it('should contain a view name for each view in the array', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      con.getFrontendViews((viewsError, views) => {
        views.forEach((view) => {
          expect(view.view_name).toBeA('string');
        });
        done();
      });
    });
  });
});

