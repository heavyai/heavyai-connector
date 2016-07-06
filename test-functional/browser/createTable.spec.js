import expect from 'expect';
import { connect, browserTest } from '../utils/utils-transpiled';
import { tableNameSync, tableNameAsync } from '../mocks/mocks-transpiled';

describe('#createTable', () => {
  it('should throw an error if not connected to a server',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      const rowDesc = _createRowDesc(window);
      try {
        con.createTable(tableNameSync, rowDesc, () => { /* no-op */ });
      } catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    })
  );

  xit('sync - should create the table',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      const rowDesc = _createRowDesc(window);
      const tableName = con.createTable(tableNameSync, rowDesc);
      expect(tableName).toEqual(tableNameSync);
      done();
    })
  );

  it('async - should create the table',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      const rowDesc = _createRowDesc(window);
      con.createTable(tableNameSync, rowDesc, done);
    })
  );
});

function _createRowDesc(context) {
  return [
    new context.TColumnType({
      col_name: 'Sequence',
      col_type: new context.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'orgID',
      col_type: new context.TTypeInfo({ type: 6, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'raceID',
      col_type: new context.TTypeInfo({ type: 6, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'carID',
      col_type: new context.TTypeInfo({ type: 6, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'lap',
      col_type: new context.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'RaceSegment',
      col_type: new context.TTypeInfo({ type: 6, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'timestamp',
      col_type: new context.TTypeInfo({ type: 2, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'arrivalTimestamp',
      col_type: new context.TTypeInfo({ type: 2, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'speed',
      col_type: new context.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'engineTemp',
      col_type: new context.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'clutchDepress',
      col_type: new context.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'gear',
      col_type: new context.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'rpm',
      col_type: new context.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'brakePressure',
      col_type: new context.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'cylinderPressure',
      col_type: new context.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'lat',
      col_type: new context.TTypeInfo({ type: 3, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'lon',
      col_type: new context.TTypeInfo({ type: 3, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'merc_x',
      col_type: new context.TTypeInfo({ type: 3, encoding: 0, nullable: false, is_array: false })
    }),
    new context.TColumnType({
      col_name: 'merc_y',
      col_type: new context.TTypeInfo({ type: 3, encoding: 0, nullable: false, is_array: false })
    }),
  ];
}
