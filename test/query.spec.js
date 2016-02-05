// NPM Dependencies
import expect from 'expect';
import { jsdom } from 'jsdom';

// Custom Dependences
import { connect, loadScripts } from './utils';
import { html, queries } from './mocks';

// JSDom Configuration
const scripts = loadScripts();

describe('#query', () => {
  it('should synchronously get the number of tweets where country is Columbia ', () => {
    const test = (err, window) => {
      const mapdcon = connect(new window.MapdCon());
      const result = mapdcon.query(queries[0]);
      expect(result[0].n).toEqual(5730);
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should asynchronously get the number of tweets with a single callback', (done) => {
    const test = (err, window) => {
      const mapdcon = connect(new window.MapdCon());
      const options = {};
      const callbacks = [
        (result) => {
          expect(result[0].n).toEqual(5730);
          done();
        },
      ];
      mapdcon.query(queries[0], options, callbacks);
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should asynchronously get the number of tweets with multiple callbacks', (done) => {
    const test = (err, window) => {
      const mapdcon = connect(new window.MapdCon());
      const options = {};
      const callbacks = [
        (result) => {
          expect(result[0].n).toEqual(5730);
        },
        (result) => {
          expect(result[0].n).toEqual(5730);
          done();
        },
      ];
      mapdcon.query(queries[0], options, callbacks);
    };
    jsdom.env({ html, src: scripts, done: test });
  });
});
