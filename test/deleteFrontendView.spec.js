// NPM Dependencies
import expect from 'expect';
import { jsdom } from 'jsdom';

// Custom Dependences
import { connect, loadScripts } from './utils';
import { html } from './mocks';

// JSDom Configuration
const scripts = loadScripts();

describe('MapdCon#deleteFrontendView', () => {
  it('should delete a frontend view with name "test_view"', (done) => {
    const test = (err, window) => {
      const mapdcon = connect(new window.MapdCon());
      const callback = () => {
        const filtered = mapdcon.getFrontendViews().filter((view) => {
          return view.view_name === 'test_view';
        });
        expect(filtered).toEqual([]);
        done();
      };
      mapdcon.deleteFrontendView('test_view', callback);
    };
    jsdom.env({ html, src: scripts, done: test });
  });
});
