// Bind arguments starting with argument number "n".
// NOTE: n is 1-indexed
export const bindArgsFromN = (fn, n, ...boundArgs) =>
  function func(...args) {
    return fn(...args.slice(0, n - 1), ...boundArgs)
  }


/**
 * Converts a raw integer timestamp value from the DB into milliseconds. The DB timestamp value may
 * represent seconds, ms, us, or ns depending on the precision of the column. This value is
 * truncated or extended as necessary to convert to ms precision. The returned ms value is suitable
 * for passing to the JS Date object constructor.
 * @param {Number} timestamp - The raw integer timestamp in the database.
 * @param {Number} precision - The precision of the timestamp column in the database.
 * @returns {Number} The equivalent timestamp in milliseconds.
 */
export function timestampToMs(timestamp, precision) {
  // A precision of 0 = sec, 3 = ms. Thus, this line finds the value to divide the DB val
  // eslint-disable-next-line no-magic-numbers
  const divisor = 10 ** (precision - 3)
  const timeInMs = timestamp / divisor

  return timeInMs
}