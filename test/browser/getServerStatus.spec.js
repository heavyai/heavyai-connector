import expect from 'expect';
import { jsdom } from 'jsdom';
import { connect, loadScripts } from '../utils';
import { html } from '../mocks';

const scripts = loadScripts();

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
      const con = connect(new window.MapdCon());
      const serverStatus = con.getServerStatus();
      expect(serverStatus).toBeA(window.TServerStatus);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should get the connected server status with a callback', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getServerStatus((serverStatus) => {
          expect(serverStatus).toBeA(window.TServerStatus);
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});

