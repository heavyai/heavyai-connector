import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';
import { viewNameSync, viewNameAsync } from '../mocks/mocks-transpiled';

describe('#getFrontendView', () => {
  let testViewAsync;

  it('async - should get a frontend view with name "test_view_async"',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getFrontendView(viewNameAsync, (error, view) => {
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
    expect(testViewAsync.view_name).toEqual(viewNameAsync);
  });
});
