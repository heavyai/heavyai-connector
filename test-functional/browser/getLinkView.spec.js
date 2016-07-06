import expect from 'expect';
import { connect, browserTest, randomString } from '../utils/utils-transpiled';
import { viewLink } from '../mocks/mocks-transpiled';

describe('#getLinkView', () => {
  let testViewSync;
  let testViewAsync;

  it('should throw an error if not connected',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      let view;
      try {
        view = con.getLinkView(viewLink);
      } catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    })
  );


  it('async - should get a frontend view by link',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (connectError, sessionId) => {
        con.getLinkView(viewLink, (error, view) => {
          testViewAsync = view;
          expect(view).toBeA(window.TFrontendView);
          done();
        });
      });
    })
  );

  it('should contain a view_state', () => {
    expect(testViewAsync.view_state.length).toBeGreaterThan(0);
  });

  it('should contain a valid view_name property', () => {
    expect(testViewAsync.view_name).toEqual(viewLink);
  });
});
