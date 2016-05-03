var fileName = 'data.csv';
var filePath = './test/mocks/' + fileName;

var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;

var mocks = require('../mocks/mocks-transpiled');
var MapdTypes = require('../../dist/node/mapd_types');

describe('#importTable', () => {
  it('should throw an error if not connected to a server', () => {
  var con = new MapdCon();
    expect(() => {
      con.importTable(mocks.tableNameAsync, fileName, mocks.copyParams, function(tableError, table) {
        // no-op
      });
    }).toThrow('You are not connected to a server. Try running the connect method first.');
  });

  it('should throw an error without a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(() => {
        con.importTable(mocks.tableNameAsync, fileName, mocks.copyParams);
      }).toThrow('You must specify a callback for the importTable method.');
      done();
    });
  });

  it('async - should import a table', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      utils.uploadFile(sessionId, filePath, (uploadError, res) => {
        con.importTable(mocks.tableNameAsync, fileName, utils.makeCopyParams(), (tableError, tableName) => {
          expect(tableName).toEqual(mocks.tableNameAsync);
          utils.deleteUploadedFile(sessionId, fileName, (deleteError, res) => {
            expect(res.statusCode).toBe(200);
            done();
          });
        });
      });
    });
  });
});


