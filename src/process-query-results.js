import processColumnarResults from "./process-columnar-results"
import processRowResults from "./process-row-results"
/**
 * Determines how to process raw results when they return from the server.
 *
 * @param {Boolean} logging If enabled, shows on the console how long the query took to run.
 * @param {Function} updateQueryTimes A function that updates internal query times on the connector.
 * @param {Object} options A list of options for processing the results.
 * @param {Boolean} options.isImage Set to true when querying for backend-rendered images.
 * @param {Boolean} options.eliminateNullRows Removes null rows.
 * @param {String} options.query The SQL query string used only for logging.
 * @param {Number} options.queryId The ID of the query.
 * @param {Number} options.conId The unique connector identification.
 * @param {String} options.estimatedQueryTime The estimate of the query time.
 * @param {Object} result - The query result used to decide whether to process
 *                          as column or row results.
 * @return {Object} result if image, otherwise formatted results.
 */
export default function processQueryResults(logging, updateQueryTimes) {
  return function (options, _datumEnum, result) {
    let isImage = false
    let eliminateNullRows = false
    let query = null
    let queryId = null
    let conId = null
    let estimatedQueryTime = null

    if (typeof options !== "undefined") {
      isImage = options.isImage ? options.isImage : false
      eliminateNullRows = options.eliminateNullRows
        ? options.eliminateNullRows
        : false
      query = options.query ? options.query : null
      queryId = options.queryId ? options.queryId : null
      conId = typeof options.conId === "undefined" ? null : options.conId
      estimatedQueryTime =
        typeof options.estimatedQueryTime === "undefined"
          ? null
          : options.estimatedQueryTime
    }
    if (
      result.execution_time_ms &&
      conId !== null &&
      estimatedQueryTime !== null
    ) {
      updateQueryTimes(
        conId,
        queryId,
        estimatedQueryTime,
        result.execution_time_ms
      )
    }

    // should use node_env
    if (logging && result.execution_time_ms) {
      // eslint-disable-next-line no-console
      console.log(
        query,
        "on Server",
        conId,
        "- Execution Time:",
        result.execution_time_ms,
        "ms, Total Time:",
        result.total_time_ms,
        "ms"
      )
    }

    if (isImage) {
      return result
    } else {
      let formattedResult = null

      if (!result.row_set) {
        throw new Error("No result to process")
      }

      if (result.row_set.is_columnar) {
        formattedResult = processColumnarResults(
          result.row_set,
          eliminateNullRows,
          _datumEnum
        )
      } else {
        formattedResult = processRowResults(
          result.row_set,
          eliminateNullRows,
          _datumEnum
        )
      }

      formattedResult.timing = {
        execution_time_ms: result.execution_time_ms,
        total_time_ms: result.total_time_ms
      }

      return options.returnTiming ? formattedResult : formattedResult.results
    }
  }
}
