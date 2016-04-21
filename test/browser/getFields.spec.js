import expect from 'expect';
import { jsdom } from 'jsdom';
import { connect, loadScripts } from '../utils';
import { html } from '../mocks';

const scripts = loadScripts();

describe('#getFields', () => {
  it('should throw an error if not connected to a server', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      let fields;
      try { fields = con.getFields(process.env.TABLE_NAME); }
      catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    }
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('sync - should get the field names of the given table', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      expect(true).toEqual(true);
      let fields;
      try { fields = con.getFields(process.env.TABLE_NAME); }
      catch (e) { console.log(e); }
      expect(fields).toBeAn('array');
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should get the field names of the given table', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getFields('tweets', (fields) => {
          expect(fields).toBeAn('array');
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});



