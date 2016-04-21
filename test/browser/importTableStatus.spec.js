import expect from 'expect';
import { jsdom } from 'jsdom';
import { loadScripts, connect } from '../utils';

import { html } from '../mocks';

const scripts = loadScripts();
const fileName = 'data.csv';

describe('#importTableStatus', () => {
  it('should throw an error if not connected to a server', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      try  { con.importTableStatus(fileName, (importStatus) => { /* no-op */ }); }
      catch (e) { expect(!!e).toEqual(true); }
      finally { done(); }
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('sync - should import a table', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      const importStatus = con.importTableStatus(fileName);
      expect(importStatus).toBeAn(window.TImportStatus);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('async - should import a table', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      con.importTableStatus(fileName, (importStatus) => {
        expect(importStatus).toBeA(window.TImportStatus);
        done();
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});





