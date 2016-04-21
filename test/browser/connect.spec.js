import expect from 'expect';
import { jsdom } from 'jsdom';
import { connect, loadScripts } from '../utils';
import { html } from '../mocks';

const scripts = loadScripts();

describe('#connect', (done) => {
  it('sync - should create a connection', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      expect(con.sessionId()[0]).toBeA('number');
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should create a connection with a callback', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        expect(Array.isArray(con.sessionId())).toEqual(true);
        expect(Array.isArray(con.client())).toEqual(true);
        done();
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});
