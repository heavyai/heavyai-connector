var expect = require('expect');
var utils = require('../utils/utils-transpiled');
var MapdCon = require('../../build/MapdConNode').MapdCon;
var MapdTypes = require('../../thrift/node/mapd_types');

describe('#getServerStatus', () => {
  it('should throw an error if not connected to a server', () => {
      var con = new MapdCon();
      var serverStatus;
      try {
        serverStatus = con.getServerStatus((error, serverStatus) => {
          // no-op
        });
      } catch (e) {
        expect(e.message).toEqual('You are not connected to a server. Try running the connect method first.');
      }
  });

  it('should throw an error without a callback', () => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      try {
        con.getServerStatus();
      } catch (e) {
        expect(e.message).toEqual('You must specify a callback for the getServerStatus method.');
      }
    });
  });

  it('async - should get the server status with a callback', (done) => {
    var con = new MapdCon();
    utils.connect(con, (connectError, sessionId) => {
      con.getServerStatus((error, serverStatus) => {
        expect(error).toEqual(null);
        expect(serverStatus).toBeA(MapdTypes.TServerStatus);
        done();
      });
    });
  });
});
