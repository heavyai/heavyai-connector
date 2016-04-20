const expect = require('expect');
const utils = require('../utils');
const jsdom = require('jsdom').jsdom;
const html = require('../mocks').html;
const scripts = utils.loadScripts();

describe('#getServerStatus', () => {
  it('should throw an error if not connected to a server', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      let serverStatus;
      try {
        serverStatus = con.getServerStatus();
      } catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('sync - should get the connected server status', (done) => {
    const browserTest = (err, window) => {
      const con = utils.connect(new window.MapdCon());
      const serverStatus = con.getServerStatus();
      expect(serverStatus).toBeA(window.TServerStatus);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should get the connected server status with a callback', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      utils.connect(con, (sessionId) => {
        con.getServerStatus((serverStatus) => {
          expect(serverStatus).toBeA(window.TServerStatus);
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});

