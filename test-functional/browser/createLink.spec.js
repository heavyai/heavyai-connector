import expect from 'expect';
import { connect, browserTest, } from '../utils/utils-transpiled';
import { viewState, viewLink } from '../mocks/mocks-transpiled';

describe('#createLink', () => {
  it('should throw an error if not connected',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      let link;
      try {
        link = con.createLink(viewState);
      } catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    })
  );

  it('sync - should create a short link',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      const link = con.createLink(viewState);
      expect(link).toBeA('string');
      expect(link).toEqual(viewLink);
      done();
    })
  );

  xit('async - should create a short link',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.createLink(viewState, (link) => {
          expect(link).toBeA('string');
          expect(link).toEqual(viewLink);
          done();
        });
      });
    })
  );
});
