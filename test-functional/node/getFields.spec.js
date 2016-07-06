var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;
var MapdTypes = require('../../thrift/node/mapd_types');

describe('#getFields', () => {
  it('should throw an error if not connected to a server', () => {
    var con = new MapdCon();
    expect(function(){
      con.getFields(process.env.TABLE_NAME, (fieldsError, fields) => {
        // no-op
      });
    }).toThrow('You are not connected to a server. Try running the connect method first.');
  });

  it('should throw an error without a callback', () => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(function() {
        con.getFields();
      }).toThrow('You must specify a callback for the getFields method.');
    });
  });

  it('async - should get the field names of the given table', (done) => {
    var con = new MapdCon();
    utils.connect(con, (sessionId) => {
      con.getFields(process.env.TABLE_NAME, (fieldsError, fields) => {
        expect(fields).toBeAn('array');
        done();
      });
    });
  });
});

