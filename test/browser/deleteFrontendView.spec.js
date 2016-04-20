import expect from 'expect';
import { jsdom } from 'jsdom';
import { html, viewNameSync, viewNameAsync } from '../mocks';
import { connect, randomString, loadScripts } from '../utils';

const scripts = loadScripts();

describe('#deleteFrontendView', () => {
  it('should throw an error if not connected', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      try {
        con.deleteFrontendView(viewNameSync, (vName) => { /* no-op */ });
      }
      catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('sync - should delete a frontend view with name "test_view"', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      con.deleteFrontendView(viewNameSync);
      // Errors are not caught, so this test will fail if one is thrown from the backend
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  /*
   * NOTE:
   * We create frontend views synchronously, but delete them asynchronously.
   */
  it('async - should delete a frontend view with name "test_view"', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => { con.deleteFrontendView(viewNameSync, done); });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});
