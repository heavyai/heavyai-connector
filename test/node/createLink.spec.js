var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;
var mocks = require('../mocks/mocks-transpiled');
var viewState = mocks.viewState;
var viewLink = mocks.viewLink;

describe('#createLink', () => {
  it('should throw an error if not connected', () => {
    var con = new MapdCon();
    var createLink = _createLink.bind(this, con, viewState, (error, link) => {
      // no-op
    });
    expect(createLink).toThrow('You are not connected to a server. Try running the connect method first.');
  });

  it('should throw an error without a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(con.createLink.bind(con, viewState)).toThrow('You must specify a callback for the createLink method.');
      done();
    });
  });

  xit('async - should create a short link', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      con.createLink(viewState, (error, link) => {
        expect(link).toBeA('string');
        expect(link).toEqual(viewLink);
        done();
      });
    });
  });
});

function _createLink(con, vS, cb) {
  con.createLink(vS, cb);
}
