/**
 * Process the column-based results from the query in a row-based format.
 * (Returning row-based results directly from the server is inefficient.)
 *
 * @param {TRowSet} data The column-based data returned from a query.
 * @param {Boolean} eliminateNullRows A flag that removes null rows from results.
 * @param {Object} dataEnum A list of types created from when executing {@link #invertDatumTypes}.
 * @returns {Object} The formatted results of the query.
 * @example <caption>Convert data returned in column-based format to row-based:</caption>
 */
export default function processColumnarResults(
  data,
  eliminateNullRows,
  dataEnum
) {
  const formattedResult = { fields: [], results: [] }
  const numCols = data.row_desc.length
  const numRows =
    typeof data.columns[0] === "undefined" ? 0 : data.columns[0].nulls.length
  // to satisfy eslint no-magic-numbers rule
  const oneThousandMilliseconds = 1000

  formattedResult.fields = data.row_desc.map(field => ({
    name: field.col_name,
    type: dataEnum[field.col_type.type],
    is_array: field.col_type.is_array
  }))

  for (let r = 0; r < numRows; r++) {
    if (eliminateNullRows) {
      let rowHasNull = false
      for (let c = 0; c < numCols; c++) {
        if (data.columns[c].nulls[r]) {
          rowHasNull = true
          break
        }
      }
      if (rowHasNull) {
        continue // eslint-disable-line no-continue
      }
    }
    const row = {}
    for (let c = 0; c < numCols; c++) {
      const fieldName = formattedResult.fields[c].name
      const fieldType = formattedResult.fields[c].type
      const fieldIsArray = formattedResult.fields[c].is_array
      const isNull = data.columns[c].nulls[r]
      if (isNull) {
        // row[fieldName] = "NULL";
        row[fieldName] = null
        continue // eslint-disable-line no-continue
      }
      if (fieldIsArray) {
        row[fieldName] = []
        const arrayNumElems = data.columns[c].data.arr_col[r].nulls.length
        for (let e = 0; e < arrayNumElems; e++) {
          if (data.columns[c].data.arr_col[r].nulls[e]) {
            row[fieldName].push("NULL")
            continue // eslint-disable-line no-continue
          }
          switch (fieldType) {
            case "BOOL":
              row[fieldName].push(
                Boolean(data.columns[c].data.arr_col[r].data.int_col[e])
              )
              break
            case "SMALLINT":
            case "INT":
            case "BIGINT":
            case "TINYINT":
              row[fieldName].push(
                data.columns[c].data.arr_col[r].data.int_col[e]
              )
              break
            case "FLOAT":
            case "DOUBLE":
            case "DECIMAL":
              row[fieldName].push(
                data.columns[c].data.arr_col[r].data.real_col[e]
              )
              break
            case "STR":
              row[fieldName].push(
                data.columns[c].data.arr_col[r].data.str_col[e]
              )
              break
            case "TIME":
            case "TIMESTAMP":
            case "DATE":
              row[fieldName].push(
                data.columns[c].data.arr_col[r].data.int_col[e] *
                  oneThousandMilliseconds
              )
              break
            default:
              throw new Error("Unrecognized array field type: " + fieldType)
          }
        }
      } else {
        switch (fieldType) {
          case "BOOL":
            row[fieldName] = Boolean(data.columns[c].data.int_col[r])
            break
          case "SMALLINT":
          case "INT":
          case "BIGINT":
          case "TINYINT":
            row[fieldName] = data.columns[c].data.int_col[r]
            break
          case "FLOAT":
          case "DOUBLE":
          case "DECIMAL":
            row[fieldName] = data.columns[c].data.real_col[r]
            break
          case "STR":
            row[fieldName] = data.columns[c].data.str_col[r]
            break
          case "TIME":
          case "TIMESTAMP":
          case "DATE":
            row[fieldName] = new Date(
              data.columns[c].data.int_col[r] * oneThousandMilliseconds
            )
            break
          case "POINT":
          case "LINESTRING":
          case "POLYGON":
          case "MULTIPOLYGON":
            row[fieldName] = data.columns[c].data.str_col[r]
            break
          default:
            throw new Error("Unrecognized field type: " + fieldType)
        }
      }
    }
    formattedResult.results.push(row)
  }
  return formattedResult
}
