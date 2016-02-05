// NPM Dependencies
import expect from 'expect';
import { jsdom } from 'jsdom';

// Custom Dependences
import { connect, loadScripts } from './utils';
import { html } from './mocks';

// JSDom Configuration
const scripts = loadScripts();

const state = { foo: 'bar' };
let link = null;

describe('MapdCon Link Methods', () => {
  describe('#createLink', () => {
    it('should create a short random string of the viewState', (done) => {
      const test = (err, window) => {
        const mapdcon = connect(new window.MapdCon());
        link = mapdcon.createLink(JSON.stringify(state));
        expect(typeof link).toEqual('string');
        done();
      };
      jsdom.env({ html, src: scripts, done: test });
    });
  });

  describe('#getLinkView', () => {
    it('should get the view back from the short random string', (done) => {
      const test = (err, window) => {
        const mapdcon = connect(new window.MapdCon());
        const view = mapdcon.getLinkView(link);
        expect(view.view_name).toEqual(link);
        expect(view.view_state).toEqual(JSON.stringify(state));
        expect(view.image_hash).toEqual('');
        done();
      };
      jsdom.env({ html, src: scripts, done: test });
    });
  });
});
