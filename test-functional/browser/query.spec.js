import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';
import { query } from '../mocks/mocks-transpiled';

describe('#query', () => {
  it('should throw an error if not connected to a server',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      let results;
      try { results = con.query(query, {}); }
      catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    })
  );

  it('sync - should get the number of tweets',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      let result = con.query(query, {});
      expect(result[0].n).toEqual(28143638);
      done();
    })
  );

  it('async - should get the number of tweets with a single callback',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      const options = {};
      const callback = (error, result) => {
        expect(result[0].n).toEqual(28143638);
        done();
      }
  
      connect(con, (sessionId) => {
        con.query(query, options, callback);
      });
    })
  );

  it('async - should get the number of tweets with multiple callbacks',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      const options = {};
      const doneCallback = (result) => {
        expect(result[0].n).toEqual(28143638);
        done();
      }
      const callback = (error, result) => {
        expect(result[0].n).toEqual(28143638);
        doneCallback(result)
      }
      connect(con, (connectError, sessionId) => {
        con.query(query, options, callback);
      });
    })
  );
});
