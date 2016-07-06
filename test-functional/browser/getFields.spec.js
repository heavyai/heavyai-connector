import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';

describe('#getFields', () => {
  it('should throw an error if not connected to a server',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      let fields;
      try { fields = con.getFields(process.env.TABLE_NAME); }
      catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    })
  );

  it('sync - should get the field names of the given table',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      expect(true).toEqual(true);
      let fields;
      try { fields = con.getFields(process.env.TABLE_NAME); }
      catch (e) { console.log(e); }
      expect(fields).toBeAn('array');
      done();
    })
  );

  xit('async - should get the field names of the given table',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getFields('tweets', (fields) => {
          expect(fields).toBeAn('array');
          done();
        });
      });
    })
  );
});



