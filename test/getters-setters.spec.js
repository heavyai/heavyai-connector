// Node Dependencies
import { readFileSync }      from 'fs';

// NPM Dependencies
import  expect             from 'expect';
import { jsdom }             from 'jsdom';

// JSDom Configuration
const html       = '<!doctype html><html><body></body></html>';
const thrift     = readFileSync("./thrift.js", "utf-8");
const mapdthrift = readFileSync("./mapd.thrift.js", "utf-8");
const mapdtypes  = readFileSync("./mapd_types.js", "utf-8");
const mapdcon    = readFileSync("./mapd-con.js", "utf-8");
const scripts    = [ thrift, mapdthrift, mapdtypes, mapdcon ];

describe('MapdCon Setters/Getters', () => {

  it('should set/get a hostname', (done) => {
    var test = (err, window) => {
      var mapdcon = new window.MapdCon();
      mapdcon.host('newhost');
      expect(mapdcon.host()).toEqual(['newhost']);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should set/get a port', (done) => {
    var test = (err, window) => {
      var mapdcon = new window.MapdCon();
      mapdcon.port('3333');
      expect(mapdcon.port()).toEqual(['3333']);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should set/get a username', (done) => {
    var test = (err, window) => {
      var mapdcon = new window.MapdCon();
      mapdcon.port('myUserName');
      expect(mapdcon.port()).toEqual(['myUserName']);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should set/get a password', (done) => {
    var test = (err, window) => {
      var mapdcon = new window.MapdCon();
      mapdcon.password('****');
      expect(mapdcon.password()).toEqual(['****']);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should set/get the database name', (done) => {
    var test = (err, window) => {
      var mapdcon = new window.MapdCon();
      mapdcon.dbName('dbName');
      expect(mapdcon.dbName()).toEqual(['dbName']);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should set/get the logging flag', (done) => {
    var test = (err, window) => {
      var mapdcon = new window.MapdCon();
      mapdcon.logging(true);
      expect(mapdcon.logging()).toEqual(true);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should set/get the platform', (done) => {
    var test = (err, window) => {
      var mapdcon = new window.MapdCon();
      mapdcon.platform('platform');
      expect(mapdcon.platform()).toEqual('platform');
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

});

