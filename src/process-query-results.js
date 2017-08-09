import processColumnarResults from "./process-columnar-results"
import processRowResults from "./process-row-results"
/**
   * Decides how to process raw results once they come back from the server.
   *
   * @param {Boolean} logging if enabled, will show how long the query took to execute in console
   * @param {Function} updateQueryTimes A function that updates internal query times on connector
   * @param {Function} logger A function logs timing info; defaults to console.log.
   * @param {Object} options A list of options for processing the results
   * @param {Boolean} options.isImage Set to true when querying for backend rendered images
   * @param {Boolean} options.eliminateNullRows Removes null rows
   * @param {String} options.query The SQL query string used only for logging
   * @param {Number} options.queryId The ID of the query
   * @param {Number} options.conId The unique connector identification
   * @param {String} options.estimatedQueryTime The estimate of the query time
   * @param {Array<Function>} the same callback coming from {@link #query}
   * @param {Object} result - The query result used to decide whether to process
   *                          as column or row results.
   * @return {Object} null if image with callbacks, result if image with callbacks,
   *                  otherwise formatted results
   */
export default function processQueryResults (logging, updateQueryTimes, logger = console.log) { // eslint-disable-line no-console
  return function (options, _datumEnum, result, callback) {
    let isImage = false
    let eliminateNullRows = false
    let query = null
    let queryId = null
    let conId = null
    let estimatedQueryTime = null
    const hasCallback = Boolean(callback)

    if (typeof options !== "undefined" && options !== null) {
      isImage = options.isImage ? options.isImage : false
      eliminateNullRows = options.eliminateNullRows ? options.eliminateNullRows : false
      query = options.query ? options.query : null
      queryId = options.queryId ? options.queryId : null
      conId = typeof options.conId === "undefined" ? null : options.conId
      estimatedQueryTime = typeof options.estimatedQueryTime === "undefined" ? null : options.estimatedQueryTime
    }
    if (result && result.execution_time_ms && conId !== null && estimatedQueryTime !== null) {
      updateQueryTimes(conId, queryId, estimatedQueryTime, result.execution_time_ms)
    }

    // should use node_env
    if (logging && result.execution_time_ms) {
      logger(
        query,
        "on Server",
        conId,
        "- Execution Time:",
        result.execution_time_ms,
        " ms, Total Time:",
        result.total_time_ms + "ms"
      )
    }

    if (isImage && hasCallback) {
      return callback(null, result)
    } else if (isImage && !hasCallback) {
      return result
    } else { // !isImage
      let formattedResult = null

      if (!result || !result.row_set) {
        if (hasCallback) {
          return callback(new Error("No result to process"))
        } else {
          throw new Error("No result to process")
        }
      }

      if (result.row_set.is_columnar) {
        formattedResult = processColumnarResults(result.row_set, eliminateNullRows, _datumEnum)
      } else {
        formattedResult = processRowResults(result.row_set, eliminateNullRows, _datumEnum)
      }

      formattedResult.timing = {
        execution_time_ms: result.execution_time_ms,
        total_time_ms: result.total_time_ms
      }

      if (hasCallback) {
        return callback(null, (options && options.returnTiming) ? formattedResult : formattedResult.results)
      } else {
        return (options && options.returnTiming) ? formattedResult : formattedResult.results
      }
    }
  }
}
