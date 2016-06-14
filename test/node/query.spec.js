var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;

var mocks = require('../mocks/mocks-transpiled');
var MapdTypes = require('../../thrift/node/mapd_types');

describe('#query', () => {
  it('should throw an error if not connected', () => {
    var con = new MapdCon();
    expect(function() {
      con.query(mocks.query, {}, [() => {}]);  
    }).toThrow('You are not connected to a server. Try running the connect method first.');
  });

  it('should throw an error without a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      expect(con.query.bind(con, mocks.query, {}))
        .toThrow('You must specify a callbacks array for the query method.');
      done();
    });
  });

  it('async - should get the number of tweets with a single callback', (done) => {
    var con = new MapdCon();
    var options = {};
    var callbacks = [
      (result) => {
        expect(parseInt(result[0].n)).toEqual(28143638);
        done();
      }
    ];
    utils.connect(con, (connectError, sessionId) => {
      con.query(mocks.query, options, callbacks);
    });
  });

  it('async - should get the number of tweets with multiple callbacks', (done) => {
    var con = new MapdCon();
    var options = {};
    var callbacks = [
      (result) => {
        expect(parseInt(result[0].n)).toEqual(28143638);
      },
      (result) => {
        expect(parseInt(result[0].n)).toEqual(28143638);
        done();
      },
    ];
    utils.connect(con, (connectError, sessionId) => {
      con.query(mocks.query, options, callbacks);
    });
  });
});
