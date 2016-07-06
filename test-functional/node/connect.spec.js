var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;

describe('#connect', () => {
  it('should throw an error without a callback', () => {
    var con = new MapdCon();
    expect(con.connect).toThrow('You must specify a callback for the connect method.');
  });
  it('async - should create a connection with a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(connectError).toEqual(null);
      expect(sessionId).toBeA('number');
      done();
    });
  });
});
