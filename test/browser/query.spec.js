import expect from 'expect';
import { jsdom } from 'jsdom';
import { connect, loadScripts } from '../utils';
import { html, query } from '../mocks';
const scripts = loadScripts();

describe('#query', () => {
  it('should throw an error if not connected to a server', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      let results;
      try { results = con.query(query, {}); }
      catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('sync - should get the number of tweets', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      let result = con.query(query, {});
      expect(result[0].n).toEqual(28143638);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('async - should get the number of tweets with a single callback', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      const options = {};
      const callbacks = [
        (result) => {
          expect(result[0].n).toEqual(28143638);
          done();
        }
      ];
      connect(con, (sessionId) => {
        con.query(query, options, callbacks);
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('async - should get the number of tweets with multiple callbacks', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      const options = {};
      const callbacks = [
        (result) => {
          expect(result[0].n).toEqual(28143638);
        },
        (result) => {
          expect(result[0].n).toEqual(28143638);
          done();
        },
      ];
      connect(con, (connectError, sessionId) => {
        con.query(query, options, callbacks);
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});



