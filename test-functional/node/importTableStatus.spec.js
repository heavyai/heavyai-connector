var fileName = 'data.csv';

var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;
var MapdTypes = require('../../thrift/node/mapd_types');

describe('#importTableStatus', () => {
  it('should throw an error if not connected to a server', () => {
  var con = new MapdCon();
    expect(() => {
      con.importTableStatus(fileName, (tableError, table) => {
        // no-op
      });
    }).toThrow('You are not connected to a server. Try running the connect method first.');
  });

  it('should throw an error without a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(() => {
        con.importTableStatus(fileName);
      }).toThrow('You must specify a callback for the importTableStatus method.');
      done();
    });
  });

  it('async - should get the table import status', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      con.importTableStatus(fileName, (err, importStatus) => {
        expect(importStatus).toBeAn(MapdTypes.TImportStatus);
        done();
      });
    });
  });
});



