import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';

describe('#disconnect', () => {
  it('sync - should disconnect if connected',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      con.disconnect();
      expect(con.sessionId()).toEqual(null);
      done();
    })
  );

  it('sync - should behave normally even if not connected',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      con.disconnect();
      expect(con.sessionId()).toEqual(null);
      done();
    })
  );

  xit('async - should disconnect with a callback if connected',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.disconnect((disconnected) => {
          expect(disconnected).toEqual(true);
          done();
        });
      });
    })
  );

  xit('async - should behave normally even if already disconnected',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      con.disconnect((disconnected) => {
        expect(disconnected).toEqual(true);
        done();
      });
    })
  );
});
