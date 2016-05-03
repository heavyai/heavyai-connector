var fileName = 'data.csv';
var filePath = './test/mocks/' + fileName;

var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var mocks = require('../mocks/mocks-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;
var MapdTypes = require('../../dist/node/mapd_types');

describe('#detectColumnTypes', () => {
  it('should throw an error if not connected to a server', () => {
    var con = new MapdCon();
    expect(function(){
      con.detectColumnTypes(null, filePath, (tableError, tableData) => {
        // no-op
      });
    }).toThrow('You are not connected to a server. Try running the connect method first.');
  });

  it('should throw an error without a callback', () => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(function() {
        con.detectColumnTypes();
      }).toThrow('You must specify a callback for the detectColumnTypes method.');
    });
  });

  it('async - should get the table data from file', (done) => {
    var con = new MapdCon();
    var copyParams = utils.makeCopyParams();
    utils.connect(con, (connectError, sessionId) => {
      utils.uploadFile(sessionId, filePath, (uploadError, res) => {
        con.detectColumnTypes(fileName, copyParams, (tableError, tableData) => {
          var columnHeaders = tableData.row_set.row_desc;
          var rows = tableData.row_set.rows;
          expect(tableData).toBeA(MapdTypes.TDetectResult);
          expect(columnHeaders).toBeAn(Array);
          expect(columnHeaders.length).toBeGreaterThan(0);
          expect(rows.length).toBeGreaterThan(0);
          utils.deleteUploadedFile(sessionId, fileName, (deleteError, res) => {
            expect(res.statusCode).toBe(200);
            done();
          });
        });
      });
    });
  });
});


