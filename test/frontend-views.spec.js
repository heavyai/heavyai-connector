// NPM Dependencies
import expect from 'expect';
import { jsdom } from 'jsdom';

// Custom Dependences
import { connect, loadScripts } from './utils';

// JSDom Configuration
const html = '<!doctype html><html><body></body></html>';
const scripts = loadScripts();

describe('MapdCon#getFrontendViews', () => {
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

describe('MapdCon#getFrontendView', () => {
  it('should get an frontend view by name', (done) => {
    const test = (err, window) => {
      const con = connect(new window.MapdCon());
      const views = con.getFrontendViews();
      const view = con.getFrontendView(views[0].view_name);
      expect(view).toBeA(window.TFrontendView);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should return null if not connected', (done) => {
    const test = (err, window) => {
      const con = new window.MapdCon();
      const result = con.getFrontendView();
      expect(result).toBe(null);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should contain a view_state', (done) => {
    const test = (err, window) => {
      const con = connect(new window.MapdCon());
      const views = con.getFrontendViews();
      const view = con.getFrontendView(views[0].view_name);
      expect(view.view_state.length).toBeGreaterThan(0);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
  it('should contain a valid view_name property', (done) => {
    const test = (err, window) => {
      const con = connect(new window.MapdCon());
      const views = con.getFrontendViews();
      const view = con.getFrontendView(views[0].view_name);
      expect(view.view_name).toEqual(views[0].view_name);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
});
