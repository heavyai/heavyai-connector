import expect from 'expect';
import { connect, browserTest, randomString } from '../utils/utils-transpiled';
import { viewNameSync, viewNameAsync } from '../mocks/mocks-transpiled';

const viewState = randomString(10);

describe('#createFrontendView', () => {
  it('should throw an error if not connected',
    browserTest((done, window) => {
      const imageHash = randomString(8, 'n');
      const con = new window.MapdCon();
      try {
        con.createFrontendView(viewNameSync, viewState, imageHash);
      } catch (e) {
        expect(!!e).toEqual(true);
      }
      done();
    })
  );

  it('sync - should create a new frontend view with name "test_view"',
    browserTest((done, window) => {
      const imageHash = randomString(8, 'n');
      const con = connect(new window.MapdCon());
      con.createFrontendView(viewNameSync, viewState, imageHash);
      done();
    })
  );

  xit('async - should create a new frontend view with name "test_view_async"',
    browserTest((done, window) => {
      const imageHash = randomString(8, 'n');
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        const t = con.createFrontendView(viewNameAsync, viewState, imageHash, (viewName) => {
          expect(viewName).toEqual(viewNameAsync);
          done();
        });
      });
    })
  );
});
