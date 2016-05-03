import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';
import { viewNameSync, viewNameAsync } from '../mocks/mocks-transpiled';

describe('#getFrontendView', () => {
  let testViewSync;
  // let testViewAsync;
  it('should return null if not connected',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      const view = con.getFrontendView();
      expect(view).toEqual(null);
      done();
    })
  );

  it('sync - should get a frontend view with name "test_view"',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      const view = con.getFrontendView(viewNameSync);
      testViewSync = view;
      expect(view).toBeA(window.TFrontendView);
      done();
    })
  );

  xit('async - should get a frontend view with name "test_view_async"',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getFrontendView(viewNameAsync, (view) => {
          testViewAsync = view;
          expect(view).toBeA(window.TFrontendView);
          done();
        });
      });
    })
  );

  it('should contain a view_state', () => {
    expect(testViewSync.view_state.length).toBeGreaterThan(0);
    // expect(testViewAsync.view_state.length).toBeGreaterThan(0);
  });

  it('should contain a valid view_name property', () => {
    expect(testViewSync.view_name).toEqual(viewNameSync);
    // expect(testViewAsync.view_name).toEqual(viewNameAsync);
  });
});
