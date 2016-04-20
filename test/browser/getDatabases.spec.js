const expect = require('expect');
const utils = require('../utils');
const jsdom = require('jsdom').jsdom;
const mocks = require('../mocks');
const html = mocks.html;
const scripts = utils.loadScripts();

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
      const con = utils.connect(new window.MapdCon());
      const databases = con.getDatabases();
      expect(databases).toBeAn('array');
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should get the list of databases on a connection', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      utils.connect(con, (sessionId) => {
        con.getDatabases((databases) => {
          expect(databases).toBeAn('array');
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});
