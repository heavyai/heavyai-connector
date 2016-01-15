
// Node Dependencies
import { readFileSync }    from 'fs';

// NPM Dependencies
import  expect             from 'expect';
import { jsdom }           from 'jsdom';

// JSDom Configuration
const html       = '<!doctype html><html><body></body></html>';
const thrift     = readFileSync("./thrift.js", "utf-8");
const mapdthrift = readFileSync("./mapd.thrift.js", "utf-8");
const mapdtypes  = readFileSync("./mapd_types.js", "utf-8");
const mapdcon    = readFileSync("./mapd-con.js", "utf-8");
const scripts    = [ thrift, mapdthrift, mapdtypes, mapdcon ];

describe('MapdCon Instance', () => {

  it('should create an instance of MapdCon', (done) => {
    var test = (err, window) => {
      var mapdcon = new window.MapdCon();
      expect(mapdcon).toBeA(window.MapdCon);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should create a connection', (done) => {
    var test = (err, window) => {
      var mapdcon = connect(new window.MapdCon())
      expect(mapdcon.sessionId()).toBeA('number');
      expect(mapdcon.client()).toBeA(window.MapDClient);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should disconnect if connected', (done) => {
    var test = (err, window) => {
      var mapdcon = connect(new window.MapdCon())
      mapdcon.disconnect();
      expect(mapdcon.sessionId()).toEqual(null);
      expect(mapdcon.client()).toEqual(null);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

});

function connect(con){
  return con
    .host('athena.mapd.com')
    .port('8100')
    .dbName('mapd')
    .user('mapd')
    .password('HyperInteractive')
    .connect();
}
