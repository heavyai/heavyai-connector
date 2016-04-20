import expect from 'expect';
import { jsdom } from 'jsdom';
import { loadScripts, connect } from '../utils';
import { html, viewState, viewLink } from '../mocks';

const scripts = loadScripts();

describe('#createLink', () => {
  it('should throw an error if not connected', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      let link;
      try {
        link = con.createLink(viewState);
      } catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('sync - should create a short link', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      const link = con.createLink(viewState);
      expect(link).toBeA('string');
      expect(link).toEqual(viewLink);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('async - should create a short link', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.createLink(viewState, (link) => {
          expect(link).toBeA('string');
          expect(link).toEqual(viewLink);
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});
