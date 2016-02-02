// Node Dependencies
import { readFileSync } from 'fs';

// NPM Dependencies
import expect from 'expect';
import { jsdom } from 'jsdom';

// JSDom Configuration
const html = '<!doctype html><html><body></body></html>';
const thrift = readFileSync('./dist/thrift.js', 'utf-8');
const mapdthrift = readFileSync('./dist/mapd.thrift.js', 'utf-8');
const mapdtypes = readFileSync('./dist/mapd_types.js', 'utf-8');
const mapdcon = readFileSync('./dist/MapdCon.js', 'utf-8');
const scripts = [thrift, mapdthrift, mapdtypes, mapdcon];

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
});
