import expect from 'expect';
import { browserTest } from '../utils/utils-transpiled';

describe('MapdCon Setters/Getters', () => {
  it('should set/get a hostname',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      con.host('newhost');
      expect(con.host()).toEqual(['newhost']);
      done();
    })
  );

  it('should set/get a port',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      con.port('3333');
      expect(con.port()).toEqual(['3333']);
      done();
    })
  );

  it('should set/get a username',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      con.user('myUserName');
      expect(con.user()).toEqual(['myUserName']);
      done();
    })
  );

  it('should set/get a password',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      con.password('****');
      expect(con.password()).toEqual(['****']);
      done();
    })
  );

  it('should set/get the database name',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      con.dbName('dbName');
      expect(con.dbName()).toEqual(['dbName']);
      done();
    })
  );

  it('should set/get the logging flag',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      con.logging(true);
      expect(con.logging()).toEqual(true);
      done();
    })
  );

  it('should set/get the platform',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      con.platform('platform');
      expect(con.platform()).toEqual('platform');
      done();
    })
  );

  it('should set/get the balance strategy',
    browserTest((done, window) => {
      const mapdcon = new window.MapdCon();
      mapdcon.balanceStrategy('foo');
      expect(mapdcon.balanceStrategy()).toEqual('foo');
      done();
    })
  );
});
