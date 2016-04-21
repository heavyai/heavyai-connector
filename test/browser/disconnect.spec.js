import expect from 'expect';
import { jsdom } from 'jsdom';
import { connect, loadScripts } from '../utils';
import { html } from '../mocks';

const scripts = loadScripts();

describe('#disconnect', () => {
  it('sync - should disconnect if connected', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
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
      connect(con, (sessionId) => {
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

