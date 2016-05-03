import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';

describe('#getFrontendViews', () => {
  it('should return null if not connected',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      const views = con.getFrontendViews();
      expect(views).toEqual(null);
      done();
    })
  );

  it('sync - should get an array of frontend views',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      const views = con.getFrontendViews();
      views.forEach((view) => {
        expect(view).toBeA(window.TFrontendView);
      });
      done();
    })
  );

  xit('async - should get an array of frontend views with a callback',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      connect(con, (sessionId) => {
        con.getFrontendViews((views) => {
          views.forEach((view) => {
            expect(view).toBeA(window.TFrontendView);
          });
          done();
        });
      });
    })
  );

  it('should contain an empty string view state for each view in the array',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      const views = con.getFrontendViews();
      views.forEach((view) => { expect(view.view_state).toEqual(''); });
      done();
    })
  );

  it('should contain a view name for each view in the array',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      const views = con.getFrontendViews();
      views.forEach((view) => { expect(view.view_name.length).toBeGreaterThan(0); });
      done();
    })
  );
});

