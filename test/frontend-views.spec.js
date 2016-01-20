// Node Dependencies
import { readFileSync }    from 'fs';

// NPM Dependencies
import  expect             from 'expect';
import { jsdom }           from 'jsdom';

// Custom Dependences
import { connect }     from './utils';

// JSDom Configuration
const html       = '<!doctype html><html><body></body></html>';
const thrift     = readFileSync("./thrift.js", "utf-8");
const mapdthrift = readFileSync("./mapd.thrift.js", "utf-8");
const mapdtypes  = readFileSync("./mapd_types.js", "utf-8");
const mapdcon    = readFileSync("./mapd-con.js", "utf-8");
const scripts    = [ thrift, mapdthrift, mapdtypes, mapdcon ];

describe('MapdCon#getFrontendViews', () => {

  it('should get an array of frontend views', (done) => {
    let test = (err, window) => {
      let mapdcon = connect(new window.MapdCon());
      let views = mapdcon.getFrontendViews();
      views.forEach((view) => {
        expect(view).toBeA(window.TFrontendView);
      });
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should return null if not connected', (done) => {
    let test = (err, window) => {
      let mapdcon = new window.MapdCon();
      let result = mapdcon.getFrontendViews();
      expect(result).toBe(null);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should contain an empty string view state for each view in the array', (done) => {
    let test = (err, window) => {
      let mapdcon = connect(new window.MapdCon());
      let views = mapdcon.getFrontendViews();
      views.forEach((view) => {
        expect(view.view_state).toEqual('');
      });
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should contain a view name for each view in the array', (done) => {
    let test = (err, window) => {
      let mapdcon = connect(new window.MapdCon());
      let views = mapdcon.getFrontendViews();
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
    let test = (err, window) => {
      let mapdcon = connect(new window.MapdCon());
      let views = mapdcon.getFrontendViews();
      let view = mapdcon.getFrontendView(views[0].view_name);
      expect(view).toBeA(window.TFrontendView);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should return null if not connected', (done) => {
    let test = (err, window) => {
      let mapdcon = new window.MapdCon();
      let result = mapdcon.getFrontendView();
      expect(result).toBe(null);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should contain a view_state', (done) => {
    let test = (err, window) => {
      let mapdcon = connect(new window.MapdCon());
      let views = mapdcon.getFrontendViews();
      let view = mapdcon.getFrontendView(views[0].view_name);
      expect(view.view_state.length).toBeGreaterThan(0);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

  it('should contain an empty string for the view_name', (done) => {
    let test = (err, window) => {
      let mapdcon = connect(new window.MapdCon());
      let views = mapdcon.getFrontendViews();
      let view = mapdcon.getFrontendView(views[0].view_name);
      expect(view.view_name.length).toEqual(0);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });

});

