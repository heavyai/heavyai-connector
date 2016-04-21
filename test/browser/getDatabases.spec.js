import expect from 'expect';
import { jsdom } from 'jsdom';
import { connect, loadScripts } from '../utils';
import { html } from '../mocks';

const scripts = loadScripts();

describe('#getDatabases', () => {
  it('should throw an error if not connected', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      let databases;
      try { databases = con.getDatabases(); }
      catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('sync - should get the list of databases on a connection', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      const databases = con.getDatabases();
      expect(databases).toBeAn('array');
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should get the list of databases on a connection', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getDatabases((databases) => {
          expect(databases).toBeAn('array');
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});
