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

describe('MapdCon Basic Methods', () => {
  it('should generate an image thumbnail hash', (done) => {
    const test = (err, window) => {
      const con = new window.MapdCon();
      const hash = con.generateImageThumbnailHashCode('0');
      expect(hash).toBeAn('number');
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
});
