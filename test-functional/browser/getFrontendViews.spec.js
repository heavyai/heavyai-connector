import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';

describe('#getFrontendViews', () => {
  it('async - should get an array of frontend views with a callback',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getFrontendViews((error, views) => {
          views.forEach((view) => {
            expect(view).toBeA(window.TFrontendView);
          });
          done();
        });
      });
    })
  );
});

