import expect from 'expect';
import { jsdom } from 'jsdom';
import { loadScripts, connect } from '../utils';
import { html, tableNameSync, tableNameAsync } from '../mocks';

const scripts = loadScripts();

describe('#createTable', () => {
  it('should throw an error if not connected to a server', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      const rowDesc = _createRowDesc(window);
      try {
        con.createTable(tableNameSync, rowDesc, () => { /* no-op */ });
      } catch (e) {
        expect(!!e).toEqual(true);  
        done();
      }
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('sync - should create the table', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      const rowDesc = _createRowDesc(window);
      const tableName = con.createTable(tableNameSync, rowDesc);
      expect(tableName).toEqual(tableNameSync);
      done();
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('async - should create the table', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      const rowDesc = _createRowDesc(window);
      con.createTable(tableNameSync, rowDesc, done);
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
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
