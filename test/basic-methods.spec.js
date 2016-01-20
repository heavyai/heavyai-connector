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

describe('MapdCon Basic Methods', () => {

  it('should generate an image thumbnail hash', (done) => {
    let test = (err, window) => {
      let mapdcon = new window.MapdCon();
      let hash = mapdcon.generateImageThumbnailHashCode('0');
      expect(hash).toBeAn('number');
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

});
