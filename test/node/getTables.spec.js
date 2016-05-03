var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;
var MapdTypes = require('../../dist/node/mapd_types');

describe('#getTables', () => {
  it('should throw an error if not connected to a server', () => {
  var con = new MapdCon();
    expect(function(){
      con.getTables((tableError, tables) => {
        // no-op
      });
    }).toThrow('You are not connected to a server. Try running the connect method first.');
  });

  it('should throw an error without a callback', () => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(function() {
        con.getTables();
      }).toThrow('You must specify a callback for the getTables method.');
    });
  });

  it('async - should get the names of the tables in the database', (done) => {
    var con = new MapdCon();
    utils.connect(con, (sessionId) => {
      con.getTables((tableError, tables) => {
        expect(tables).toBeAn('array');
        done();
      });
    });
  });
});

