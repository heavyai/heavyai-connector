import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';
import { viewNameSync, viewNameAsync } from '../mocks/mocks-transpiled';

describe('#deleteFrontendView', () => {
  it('should throw an error if not connected',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      try {
        con.deleteFrontendView(viewNameSync, (vName) => { /* no-op */ });
      }
      catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    })
  );

  xit('sync - should delete a frontend view with name "test_view"',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      con.deleteFrontendView(viewNameSync);
      // Errors are not caught, so this test will fail if one is thrown from the backend
      done();
    })
  );

  /*
   * NOTE:
   * We create frontend views synchronously, but delete them asynchronously.
   */
  it('async - should delete a frontend view with name "test_view"',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => { con.deleteFrontendView(viewNameSync, done); });
    })
  );
});
