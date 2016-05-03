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

  it('sync - should get the connected server status', 
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      const serverStatus = con.getServerStatus();
      expect(serverStatus).toBeA(window.TServerStatus);
      done();
    })
  );

  xit('async - should get the connected server status with a callback', 
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getServerStatus((serverStatus) => {
          expect(serverStatus).toBeA(window.TServerStatus);
          done();
        });
      });
    })
  );
});
