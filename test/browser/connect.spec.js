import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';

describe('#connect', () => {
  it('sync - should create a connection',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      expect(con.sessionId()[0]).toBeA('number');
      done();
    })
  );

  xit('async - should create a connection with a callback', 
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        expect(Array.isArray(con.sessionId())).toEqual(true);
        expect(Array.isArray(con.client())).toEqual(true);
        done();
      });
    })
  );
});
