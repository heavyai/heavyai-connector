export const convertObjectToThriftCopyParams = obj => new TCopyParams(obj) // eslint-disable-line no-undef

export const mutateThriftRowDesc = (rowDescArray, thriftRowDescArray) => {
  rowDescArray.forEach((obj, i) => {
    thriftRowDescArray[i].col_name = obj.clean_col_name
    thriftRowDescArray[i].col_type.encoding = obj.col_type.encoding
    thriftRowDescArray[i].col_type.precision = obj.col_type.precision
    thriftRowDescArray[i].col_type.comp_param = obj.col_type.comp_param
    thriftRowDescArray[i].col_type.scale = obj.col_type.scale
    thriftRowDescArray[i].col_type.type = obj.col_type.type
  })
  return thriftRowDescArray
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
