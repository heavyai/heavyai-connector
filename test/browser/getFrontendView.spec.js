import expect from 'expect';
import { jsdom } from 'jsdom';
import { loadScripts, connect } from '../utils';
import { html, viewNameSync, viewNameAsync } from '../mocks';

const scripts = loadScripts();

describe('#getFrontendView', () => {
  let testViewSync;
  // let testViewAsync;
  it('should return null if not connected', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      const view = con.getFrontendView();
      expect(view).toEqual(null);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('sync - should get a frontend view with name "test_view"', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      const view = con.getFrontendView(viewNameSync);
      testViewSync = view;
      expect(view).toBeA(window.TFrontendView);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should get a frontend view with name "test_view_async"', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getFrontendView(viewNameAsync, (view) => {
          testViewAsync = view;
          expect(view).toBeA(window.TFrontendView);
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('should contain a view_state', () => {
    expect(testViewSync.view_state.length).toBeGreaterThan(0);
    // expect(testViewAsync.view_state.length).toBeGreaterThan(0);
  });

  it('should contain a valid view_name property', () => {
    expect(testViewSync.view_name).toEqual(viewNameSync);
    // expect(testViewAsync.view_name).toEqual(viewNameAsync);
  });
});
