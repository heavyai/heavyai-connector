const expect = require('expect');
const utils = require('../utils');
const jsdom = require('jsdom').jsdom;
const html = require('../mocks').html;
const scripts = utils.loadScripts();

describe('#disconnect', () => {
  it('sync - should disconnect if connected', (done) => {
    const browserTest = (err, window) => {
      const con = utils.connect(new window.MapdCon());
      con.disconnect();
      expect(con.sessionId()).toEqual(null);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('sync - should behave normally even if not connected', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      con.disconnect();
      expect(con.sessionId()).toEqual(null);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should disconnect with a callback if connected', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      utils.connect(con, (sessionId) => {
        con.disconnect((disconnected) => {
          expect(disconnected).toEqual(true);
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should behave normally even if already disconnected', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      con.disconnect((disconnected) => {
        expect(disconnected).toEqual(true);
        done();
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});

