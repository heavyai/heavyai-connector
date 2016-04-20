import expect from 'expect';
import { jsdom } from 'jsdom';
import { loadScripts, connect } from '../utils';
import { html, viewLink } from '../mocks';
const scripts = loadScripts();

describe('#getLinkView', () => {
  let testViewSync;
  // let testViewAsync;

  it('should throw an error if not connected', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      let view;
      try {
        view = con.getLinkView(viewLink);
      } catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('sync - should get a frontend view by link', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      const view = con.getLinkView(viewLink);
      testViewSync = view;
      expect(view).toBeA(window.TFrontendView);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should get a frontend view by link', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      connect(con, (connectError, sessionId) => {
        con.getLinkView(viewLink, (view) => {
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
    expect(testViewSync.view_name).toEqual(viewLink);
    // expect(testViewAsync.view_name).toEqual(viewLink);
  });
});
