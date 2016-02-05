// NPM Dependencies
import expect from 'expect';
import { jsdom } from 'jsdom';

// Custom Dependences
import { loadScripts } from './utils';
import { html } from './mocks';

// JSDom Configuration
const scripts = loadScripts();

describe('MapdCon Setters/Getters', () => {
  it('should set/get a hostname', (done) => {
    const test = (err, window) => {
      const con = new window.MapdCon();
      con.host('newhost');
      expect(con.host()).toEqual(['newhost']);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should set/get a port', (done) => {
    const test = (err, window) => {
      const con = new window.MapdCon();
      con.port('3333');
      expect(con.port()).toEqual(['3333']);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should set/get a username', (done) => {
    const test = (err, window) => {
      const con = new window.MapdCon();
      con.user('myUserName');
      expect(con.user()).toEqual(['myUserName']);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should set/get a password', (done) => {
    const test = (err, window) => {
      const con = new window.MapdCon();
      con.password('****');
      expect(con.password()).toEqual(['****']);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should set/get the database name', (done) => {
    const test = (err, window) => {
      const con = new window.MapdCon();
      con.dbName('dbName');
      expect(con.dbName()).toEqual(['dbName']);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should set/get the logging flag', (done) => {
    const test = (err, window) => {
      const con = new window.MapdCon();
      con.logging(true);
      expect(con.logging()).toEqual(true);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should set/get the platform', (done) => {
    const test = (err, window) => {
      const con = new window.MapdCon();
      con.platform('platform');
      expect(con.platform()).toEqual('platform');
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should set/get the balance strategy', (done) => {
    const test = (err, window) => {
      const mapdcon = new window.MapdCon();
      mapdcon.balanceStrategy('foo');
      expect(mapdcon.balanceStrategy()).toEqual('foo');
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
});
