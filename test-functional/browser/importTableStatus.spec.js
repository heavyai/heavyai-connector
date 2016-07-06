import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';
const fileName = 'data.csv';

describe('#importTableStatus', () => {
  it('should throw an error if not connected to a server',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      try  { con.importTableStatus(fileName, () => {}); }
      catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    })
  );

  xit('sync - should import a table',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      const importStatus = con.importTableStatus(fileName);
      expect(importStatus).toBeAn(window.TImportStatus);
      done();
    })
  );

  it('async - should import a table',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      con.importTableStatus(fileName, (importStatus) => {
        expect(importStatus).toBeA(window.TImportStatus);
        done();
      });
    })
  );
});
