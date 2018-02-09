/**
 * Because it is inefficient for the server to return a row-based
 * data structure, it is better to process the column-based results into a row-based
 * format after the fact.
 *
 * @param {TRowSet} data The column-based data returned from a query
 * @param {Boolean} eliminateNullRows A flag that allows removal of null rows from results
 * @param {Object} dataEnum A list of types created from when executing {@link #invertDatumTypes}
 * @returns {Object} processedResults The formatted results of the query
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
              break
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
          default:
            break
        }
      }
    }
    formattedResult.results.push(row)
  }
  return formattedResult
}
