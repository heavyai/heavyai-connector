const expect = require('expect');
const utils = require('../utils');
const jsdom = require('jsdom').jsdom;
const html = require('../mocks').html;
const scripts = utils.loadScripts();

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
      const con = utils.connect(new window.MapdCon());
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
      utils.connect(con, (sessionId) => {
        con.getFields('tweets', (fields) => {
          expect(fields).toBeAn('array');
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});



