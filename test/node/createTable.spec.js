var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;
var mocks = require('../mocks/mocks-transpiled');

describe('#createTable', () => {
  it('should throw an error if not connected', () => {
    var con = new MapdCon();
    expect(function() {
      con.createTable(mocks.tableNameAsync, mocks.rowDesc, () => {
        // no-op
      });
    }).toThrow('You are not connected to a server. Try running the connect method first.');
  });

  it('should throw an error without a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(con.createTable.bind(con, mocks.tableNameAsync, mocks.rowDesc))
        .toThrow('You must specify a callback for the createTable method.');
      done();
    });
  });

  it('async - should create the table', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      con.createTable(mocks.tableNameAsync, mocks.rowDesc, function(tableError, tableName) {
        expect(tableName).toEqual(mocks.tableNameAsync);
        done();
      });
    });
  });
});
