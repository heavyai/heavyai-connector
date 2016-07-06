import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';

describe('#getServerStatus', () => {
  it('should throw an error if not connected to a server', 
    browserTest((done, window) => {
      const con = new window.MapdCon();
      let serverStatus;
      try {
        serverStatus = con.getServerStatus();
      } catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    })
  );

  it('async - should get the connected server status with a callback', 
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getServerStatus((error, serverStatus) => {
          expect(serverStatus).toBeA(window.TServerStatus);
          done();
        });
      });
    })
  );
});
