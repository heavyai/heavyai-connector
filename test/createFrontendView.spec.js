// NPM Dependencies
import expect from 'expect';
import { jsdom } from 'jsdom';

// Custom Dependences
import { connect, loadScripts, randomString } from './utils';
import { html } from './mocks';

// JSDom Configuration
const scripts = loadScripts();

describe('#createFrontendView', () => {
  it('should create a new frontend view with name "test_view"', (done) => {
    const test = (err, window) => {
      const viewState = randomString(10);
      const imageHash = randomString(8, 'n');
      const mapdcon = connect(new window.MapdCon())
        .createFrontendView('test_view', viewState, imageHash);
      const view = mapdcon.getFrontendView('test_view');
      expect(view.view_state).toEqual(viewState);
      expect(view.image_hash).toEqual(imageHash);
      done();
    };
    jsdom.env({ html, src: scripts, done: test });
  });
});
