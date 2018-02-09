/**
 * It should be avoided to query for row-based results from the server, howerver
 * it can still be done. In this case, still process them into the same format as
 * (@link processColumnarResults} to keep the output consistent.
 * @param {TRowSet} data - The row-based data returned from a query
 * @param {Boolean} eliminateNullRows A flag that allows removal of null rows from results
 * @param {Object} datumEnum A list of types created from when executing {@link #invertDatumTypes}
 * @returns {Object} processedResults
 */
export default function processRowResults(data, eliminateNullRows, datumEnum) {
  const numCols = data.row_desc.length
  const formattedResult = { fields: [], results: [] }

  formattedResult.fields = data.row_desc.map(field => ({
    name: field.col_name,
    type: datumEnum[field.col_type.type],
    is_array: field.col_type.is_array
  }))

  formattedResult.results = []
  let numRows = 0
  if (typeof data.rows !== "undefined" && data.rows !== null) {
    numRows = data.rows.length // so won't throw if data.rows is missing
  }

  for (let r = 0; r < numRows; r++) {
    if (eliminateNullRows) {
      let rowHasNull = false
      for (let c = 0; c < numCols; c++) {
        if (data.rows[r].columns[c].is_null) {
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
      if (fieldIsArray) {
        if (data.rows[r].cols[c].is_null) {
          row[fieldName] = "NULL"
          continue // eslint-disable-line no-continue
        }
        row[fieldName] = []
        const arrayNumElems = data.rows[r].cols[c].val.arr_val.length
        for (let e = 0; e < arrayNumElems; e++) {
          const elemDatum = data.rows[r].cols[c].val.arr_val[e]
          if (elemDatum.is_null) {
            row[fieldName].push("NULL")
            continue // eslint-disable-line no-continue
          }
          switch (fieldType) {
            case "BOOL":
              row[fieldName].push(Boolean(elemDatum.val.int_val))
              break
            case "SMALLINT":
            case "INT":
            case "BIGINT":
              row[fieldName].push(elemDatum.val.int_val)
              break
            case "FLOAT":
            case "DOUBLE":
            case "DECIMAL":
              row[fieldName].push(elemDatum.val.real_val)
              break
            case "STR":
              row[fieldName].push(elemDatum.val.str_val)
              break
            case "TIME":
            case "TIMESTAMP":
            case "DATE":
              row[fieldName].push(elemDatum.val.int_val * 1000) // eslint-disable-line no-magic-numbers
              break
            default:
              break
          }
        }
      } else {
        const scalarDatum = data.rows[r].cols[c]
        if (scalarDatum.is_null) {
          row[fieldName] = "NULL"
          continue // eslint-disable-line no-continue
        }
        switch (fieldType) {
          case "BOOL":
            row[fieldName] = Boolean(scalarDatum.val.int_val)
            break
          case "SMALLINT":
          case "INT":
          case "BIGINT":
            row[fieldName] = scalarDatum.val.int_val
            break
          case "FLOAT":
          case "DOUBLE":
          case "DECIMAL":
            row[fieldName] = scalarDatum.val.real_val
            break
          case "STR":
            row[fieldName] = scalarDatum.val.str_val
            break
          case "TIME":
          case "TIMESTAMP":
          case "DATE":
            row[fieldName] = new Date(scalarDatum.val.int_val * 1000) // eslint-disable-line no-magic-numbers
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
