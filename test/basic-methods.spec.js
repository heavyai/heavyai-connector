// NPM Dependencies
import expect from 'expect';
import { jsdom } from 'jsdom';

import { loadScripts } from './utils';
import { html } from './mocks';

// JSDom Configuration
const scripts = loadScripts();

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
