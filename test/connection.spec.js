// NPM Dependencies
import expect from 'expect';
import { jsdom } from 'jsdom';
import { connect, loadScripts } from './utils';
import { html } from './mocks';

// JSDom Configuration
const scripts = loadScripts();

describe('MapdCon Connection', () => {
  it('should create an instance of MapdCon', (done) => {
    const test = (err, window) => {
      const con = new window.MapdCon();
      expect(con).toBeA(window.MapdCon);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should create a connection', (done) => {
    const test = (err, window) => {
      const con = connect(new window.MapdCon());
      expect(Array.isArray(con.sessionId())).toEqual(true);
      expect(Array.isArray(con.client())).toEqual(true);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should disconnect if connected', (done) => {
    const test = (err, window) => {
      const con = connect(new window.MapdCon());
      con.disconnect();
      expect(con.sessionId()).toEqual(null);
      expect(con.client()).toEqual(null);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should get the server status', (done) => {
    const test = (err, window) => {
      const con = connect(new window.MapdCon());
      const serverStatus = con.getServerStatus();
      expect(serverStatus).toBeAn('object');
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
});
