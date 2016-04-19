const expect = require('expect');
const jsdom = require('jsdom').jsdom;
const html = require('../mocks').html;
const utils = require('../utils');
const scripts = utils.loadScripts();

describe('#connect', (done) => {
  it('sync - should create a connection', (done) => {
    const browserTest = (err, window) => {
      const con = utils.connect(new window.MapdCon());
      expect(con.sessionId()[0]).toBeA('number');
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should create a connection with a callback', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      utils.connect(con, (sessionId) => {
        expect(Array.isArray(con.sessionId())).toEqual(true);
        expect(Array.isArray(con.client())).toEqual(true);
        done();
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});

