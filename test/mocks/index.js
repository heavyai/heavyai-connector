// const MapdTypes = require('../../dist/node/mapd_types');
// var rowDesc = [
//   new MapdTypes.TColumnType({
//     col_name: 'Sequence',
//     col_type: new MapdTypes.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'orgID',
//     col_type: new MapdTypes.TTypeInfo({ type: 6, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'raceID',
//     col_type: new MapdTypes.TTypeInfo({ type: 6, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'carID',
//     col_type: new MapdTypes.TTypeInfo({ type: 6, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'lap',
//     col_type: new MapdTypes.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'RaceSegment',
//     col_type: new MapdTypes.TTypeInfo({ type: 6, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'timestamp',
//     col_type: new MapdTypes.TTypeInfo({ type: 2, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'arrivalTimestamp',
//     col_type: new MapdTypes.TTypeInfo({ type: 2, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'speed',
//     col_type: new MapdTypes.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'engineTemp',
//     col_type: new MapdTypes.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'clutchDepress',
//     col_type: new MapdTypes.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'gear',
//     col_type: new MapdTypes.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'rpm',
//     col_type: new MapdTypes.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'brakePressure',
//     col_type: new MapdTypes.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'cylinderPressure',
//     col_type: new MapdTypes.TTypeInfo({ type: 0, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'lat',
//     col_type: new MapdTypes.TTypeInfo({ type: 3, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'lon',
//     col_type: new MapdTypes.TTypeInfo({ type: 3, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'merc_x',
//     col_type: new MapdTypes.TTypeInfo({ type: 3, encoding: 0, nullable: false, is_array: false })
//   }),
//   new MapdTypes.TColumnType({
//     col_name: 'merc_y',
//     col_type: new MapdTypes.TTypeInfo({ type: 3, encoding: 0, nullable: false, is_array: false })
//   }),
// ];

module.exports = {
  html: '<!doctype html><html><body></body></html>',
  viewNameSync: 'test_view',
  viewNameAsync: 'test_view_async',
  tableNameSync: 'test_table' + _randomString(5, 'N'),
  tableNameAsync: 'test_table_async' + _randomString(5, 'N'),
  viewState: JSON.stringify({ foo: 'bar' }), 
  viewLink: '183264ed',
  queries: [
    'SELECT count(*) AS n FROM tweets WHERE country=\'CO\'',
    'SELECT country, avg(followers) AS num_followers FROM tweets GROUP BY country',
  ],
  // rowDesc: rowDesc
};


/**
 * Return a random alpha-numeric string.
 * @param {Number} len - length of the string to create
 * @param {String} [an] - 'A' for alpha only, 'N' for numeric only
 * @return {String} randomString
 * @example
 * randomString(10);        // "4Z8iNQag9v"
 * randomString(10, "A");   // "aUkZuHNcWw"
 * randomString(10, "N");   // "9055739230"
 */
function _randomString(len, an) {
  an = an && an.toLowerCase();
  var str = '';
  var min = an === 'a' ? 10 : 0;
  var max = an === 'n' ? 10 : 62;
  for (var i = 0; i < len; i++) {
    var r = Math.random() * (max - min) + min << 0;
    var s = r < 36 ? 55 : 61;
    var t = r > 9 ? s : 48;
    str += String.fromCharCode(r += t);
  }
  return str;
}
