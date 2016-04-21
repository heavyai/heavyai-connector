import expect from 'expect';
import { jsdom } from 'jsdom';
import { connect, loadScripts } from '../utils';
import { html } from '../mocks';

const scripts = loadScripts();

describe('#getTables', () => {
  it('should throw an error if not connected to a server', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      let tables;
      try { tables = con.getTables(); }
      catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('sync - should get the names of the tables in the database', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      const tables = con.getTables();
      expect(tables).toBeAn('array');
      expect(tables[0]).toIncludeKeys(['name', 'label']);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should get the names of the tables in the database', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getTables((tables) => {
          expect(tables[0]).toIncludeKeys(['name', 'label']);
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});


