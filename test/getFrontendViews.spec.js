// NPM Dependencies
import expect from 'expect';
import { jsdom } from 'jsdom';

// Custom Dependences
import { connect, loadScripts } from './utils';
import { html } from './mocks';

// JSDom Configuration
const scripts = loadScripts();

describe('#getFrontendViews', () => {
  it('should get an array of frontend views', (done) => {
    const test = (err, window) => {
      const con = connect(new window.MapdCon());
      const views = con.getFrontendViews();
      views.forEach((view) => {
        expect(view).toBeA(window.TFrontendView);
      });
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should return null if not connected', (done) => {
    const test = (err, window) => {
      const con = new window.MapdCon();
      const result = con.getFrontendViews();
      expect(result).toBe(null);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should contain an empty string view state for each view in the array', (done) => {
    const test = (err, window) => {
      const con = connect(new window.MapdCon());
      const views = con.getFrontendViews();
      views.forEach((view) => {
        expect(view.view_state).toEqual('');
      });
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should contain a view name for each view in the array', (done) => {
    const test = (err, window) => {
      const con = connect(new window.MapdCon());
      const views = con.getFrontendViews();
      views.forEach((view) => {
        expect(view.view_name.length).toBeGreaterThan(0);
      });
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
});
