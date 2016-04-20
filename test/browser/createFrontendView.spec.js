import expect from 'expect';
import { jsdom } from 'jsdom';
import { html, viewNameSync, viewNameAsync } from '../mocks';
import { connect, randomString, loadScripts } from '../utils';

const scripts = loadScripts();
const viewState = randomString(10);

describe('#createFrontendView', () => {
  it('should throw an error if not connected', (done) => {
    const imageHash = randomString(8, 'n');
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      try {
        con.createFrontendView(viewNameSync, viewState, imageHash);
      } catch (e) {
        expect(!!e).toEqual(true);
      }
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('sync - should create a new frontend view with name "test_view"', (done) => {
    const browserTest = (err, window) => {
      const imageHash = randomString(8, 'n');
      const con = connect(new window.MapdCon());
      con.createFrontendView(viewNameSync, viewState, imageHash);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should create a new frontend view with name "test_view_async"', (done) => {
    const imageHash = randomString(8, 'n');
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        const t = con.createFrontendView(viewNameAsync, viewState, imageHash, (viewName) => {
          expect(viewName).toEqual(viewNameAsync);
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});
