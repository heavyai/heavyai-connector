// Node Dependencies
import { readFileSync }    from 'fs';

// NPM Dependencies
import  expect             from 'expect';
import { jsdom }           from 'jsdom';

// Custom Dependences
import { connect }     from './utils';

// JSDom Configuration
const html       = '<!doctype html><html><body></body></html>';
const thrift     = readFileSync("./thrift.js", "utf-8");
const mapdthrift = readFileSync("./mapd.thrift.js", "utf-8");
const mapdtypes  = readFileSync("./mapd_types.js", "utf-8");
const mapdcon    = readFileSync("./mapd-con.js", "utf-8");
const scripts    = [ thrift, mapdthrift, mapdtypes, mapdcon ];


describe('MapdCon Connection', () => {

  it('should create an instance of MapdCon', (done) => {
    let test = (err, window) => {
      let mapdcon = new window.MapdCon();
      expect(mapdcon).toBeA(window.MapdCon);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should create a connection', (done) => {
    let test = (err, window) => {
      let mapdcon = connect(new window.MapdCon());
      expect(Array.isArray(mapdcon.sessionId())).toEqual(true);
      expect(Array.isArray(mapdcon.client())).toEqual(true);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should disconnect if connected', (done) => {
    let test = (err, window) => {
      let mapdcon = connect(new window.MapdCon());
      mapdcon.disconnect();
      expect(mapdcon.sessionId()).toEqual(null);
      expect(mapdcon.client()).toEqual(null);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should get the server status', (done) => {
    let test = (err, window) => {
      let mapdcon = connect(new window.MapdCon());
      let serverStatus = mapdcon.getServerStatus();
      expect(serverStatus).toBeAn('object');
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

});
