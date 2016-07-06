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

  it('async - should get the names of the tables in the database',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getTables((error, tables) => {
          expect(tables[0]).toIncludeKeys(['name', 'label']);
          done();
        });
      });
    })
  );
});
