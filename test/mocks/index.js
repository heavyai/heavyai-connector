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
