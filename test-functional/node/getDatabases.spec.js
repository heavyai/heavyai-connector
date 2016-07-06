var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;
var MapdTypes = require('../../thrift/node/mapd_types');

describe('#getDatabases', () => {
  it('should throw an error if not connected', () => {
    var con = new MapdCon();
    var getDatabases = _getDatabases.bind(this, con, (error, databases) => {
      // no-op
    });
    expect(getDatabases).toThrow('You are not connected to a server. Try running the connect method first.');
  });

  it('should throw an error without a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(con.getDatabases.bind(con)).toThrow('You must specify a callback for the getDatabases method.');
      done();
    });
  });

  it('async - should get the list of databases on a connection', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      con.getDatabases((viewError, databases) => {
        expect(databases).toBeAn('array');
        done();
      });
    });
  });
});

function _getDatabases(con, cb) {
  con.getDatabases(cb);
}
