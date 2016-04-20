const expect = require('expect');
const utils = require('../utils');
const jsdom = require('jsdom').jsdom;
const html = require('../mocks').html;
const scripts = utils.loadScripts();

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
      const con = utils.connect(new window.MapdCon());
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
      utils.connect(con, (sessionId) => {
        con.getTables((tables) => {
          expect(tables[0]).toIncludeKeys(['name', 'label']);
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});


