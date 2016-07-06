import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';

describe('#getDatabases', () => {
  it('should throw an error if not connected',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      let databases;
      try { databases = con.getDatabases(); }
      catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    })
  );

  it('sync - should get the list of databases on a connection',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      const databases = con.getDatabases();
      expect(databases).toBeAn('array');
      done();
    })
  );

  xit('async - should get the list of databases on a connection',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getDatabases((databases) => {
          expect(databases).toBeAn('array');
          done();
        });
      });
    })
  );
});
