import expect from 'expect';
import { jsdom } from 'jsdom';
import { connect, loadScripts } from '../utils';
import { html } from '../mocks';

const scripts = loadScripts();

describe('#getFrontendViews', () => {
  it('should return null if not connected', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      const views = con.getFrontendViews();
      expect(views).toEqual(null);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('sync - should get an array of frontend views', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      const views = con.getFrontendViews();
      views.forEach((view) => {
        expect(view).toBeA(window.TFrontendView);
      });
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should get an array of frontend views with a callback', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getFrontendViews((views) => {
          views.forEach((view) => {
            expect(view).toBeA(window.TFrontendView);
          });
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('should contain an empty string view state for each view in the array', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      const views = con.getFrontendViews();
      views.forEach((view) => { expect(view.view_state).toEqual(''); });
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('should contain a view name for each view in the array', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      const views = con.getFrontendViews();
      views.forEach((view) => { expect(view.view_name.length).toBeGreaterThan(0); });
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});

