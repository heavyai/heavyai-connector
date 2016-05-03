import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';

describe('#getTables', () => {
  it('should throw an error if not connected to a server',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      let tables;
      try { tables = con.getTables(); }
      catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    })
  );

  it('sync - should get the names of the tables in the database',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      const tables = con.getTables();
      expect(tables).toBeAn('array');
      expect(tables[0]).toIncludeKeys(['name', 'label']);
      done();
    })
  );

  xit('async - should get the names of the tables in the database',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getTables((tables) => {
          expect(tables[0]).toIncludeKeys(['name', 'label']);
          done();
        });
      });
    })
  );
});
