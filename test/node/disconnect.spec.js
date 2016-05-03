var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;

describe('#disconnect', () => {
  it('should throw an error without a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(con.disconnect.bind(con)).toThrow('You must specify a callback for the disconnect method.');
      done();
    });
  });

  it('async - should disconnect with a callback if connected', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      con.disconnect((error, disconnected) => {
        expect(error).toEqual(null);
        expect(disconnected).toEqual(true);
        done();
      });
    });
  });

  it('async - should behave normally even if already disconnected', (done) => {
    var con = new MapdCon();
    con.disconnect((error, disconnected) => {
      expect(error).toEqual(null);
      expect(disconnected).toEqual(true);
      done();
    });
  });
});
