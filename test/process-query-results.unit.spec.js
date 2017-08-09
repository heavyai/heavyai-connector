/* eslint-disable no-unused-expressions */
/* eslint-disable init-declarations */
import {expect} from "chai"
import processQueryResults from "../src/process-query-results.js"

const noop = () => { /* noop */ }

describe("processQueryResults", () => {
  let logging
  let updateQueryTimes
  let options
  let _datumEnum
  let result
  let callback

  beforeEach(() => {
    logging = false
    updateQueryTimes = noop
    options = {}
    _datumEnum = {}
    result = {row_set: {rows: [], row_desc: []}}
    callback = null
  })

  it("processes row result", done => {
    callback = (error, data) => {
      expect(error).to.be.null
      expect(data).to.deep.equal([])
      done()
    }
    processQueryResults(logging, updateQueryTimes)(options, _datumEnum, result, callback)
  })

  it("processes columnar result", done => {
    result = {row_set: {is_columnar: true, row_desc: [], columns: []}}
    callback = (error, data) => {
      expect(error).to.be.null
      expect(data).to.deep.equal([])
      done()
    }
    processQueryResults(logging, updateQueryTimes)(options, _datumEnum, result, callback)
  })

  it("errors for undefined result", done => {
    result = undefined // eslint-disable-line no-undefined
    callback = error => {
      expect(error.message).to.equal("No result to process")
      done()
    }
    processQueryResults(logging, updateQueryTimes)(options, _datumEnum, result, callback)
  })

  it("doesn't blow up on undefined options", done => {
    options = undefined // eslint-disable-line no-undefined
    callback = (error, data) => {
      expect(error).to.be.null
      expect(data).to.deep.equal([])
      done()
    }
    processQueryResults(logging, updateQueryTimes)(options, _datumEnum, result, callback)
  })

  it("doesn't blow up on null options", done => {
    options = null
    callback = (error, data) => {
      expect(error).to.be.null
      expect(data).to.deep.equal([])
      done()
    }
    processQueryResults(logging, updateQueryTimes)(options, _datumEnum, result, callback)
  })

  it("returns result if no callback", () => {
    callback = null
    const data = processQueryResults(logging, updateQueryTimes)(options, _datumEnum, result, callback)
    expect(data).to.deep.equal([])
  })

  it("throws if no result and no callback", () => {
    result = null
    callback = null
    expect(() => processQueryResults(logging, updateQueryTimes)(options, _datumEnum, result, callback))
    .to.throw("No result to process")
  })

  it("just returns result if options say it's an image and no callback", () => {
    options = {isImage: true}
    callback = null
    const data = processQueryResults(logging, updateQueryTimes)(options, _datumEnum, result, callback)
    expect(data).to.equal(result)
  })

  it("just calls back with result if options say it's an image", done => {
    options = {isImage: true}
    callback = (error, data) => {
      expect(error).to.be.null
      expect(data).to.equal(result)
      done()
    }
    processQueryResults(logging, updateQueryTimes)(options, _datumEnum, result, callback)
  })

  it("logs if logging enabled and result has timing info", () => {
    logging = true
    result = {execution_time_ms: 1, total_time_ms: 2, row_set: {rows: [], row_desc: []}}
    options = {query: "select foo from bar", conId: 0}
    const logger = (...args) => expect(args).to.deep.equal([
      "select foo from bar",
      "on Server",
      0,
      "- Execution Time:",
      1,
      " ms, Total Time:",
      "2ms"
    ])
    processQueryResults(logging, updateQueryTimes, logger)(options, _datumEnum, result, callback)
  })

  // it("doesn't log without execution_time_ms", () => {
  //   logging = true
  //   result = {execution_time_ms: 1, row_set: {rows: [], row_desc: []}}
  //   options = {query: "select foo from bar", conId: 0}
  //   const logger = () => expect.fail(0, 0, "should not log")
  //   processQueryResults(logging, updateQueryTimes, logger)(options, _datumEnum, result, callback)
  // })

  it("updates query times when result.execution_time_ms, conId, estimatedQueryTime", () => {
    result = {execution_time_ms: 2, row_set: {rows: [], row_desc: []}}
    options = {conId: 0, queryId: -1, estimatedQueryTime: 1}
    updateQueryTimes = (...args) => expect(args).to.deep.equal([0, -1, 1, 2])
    processQueryResults(logging, updateQueryTimes)(options, _datumEnum, result, callback)
  })

  it("can eliminate null rows without blowing up", () => {
    options = {eliminateNullRows: true}
    processQueryResults(logging, updateQueryTimes)(options, _datumEnum, result, callback)
  })

  it("returns timing data if requested", () => {
    options = {returnTiming: true}
    result = {execution_time_ms: 2, total_time_ms: 1, row_set: {rows: [], row_desc: []}}
    const data = processQueryResults(logging, updateQueryTimes)(options, _datumEnum, result, callback)
    expect(data.results).to.deep.equal([])
    expect(data.timing).to.deep.equal({
      execution_time_ms: 2,
      total_time_ms: 1
    })
  })

  it("calls back with timing data if requested", done => {
    options = {returnTiming: true}
    result = {execution_time_ms: 2, total_time_ms: 1, row_set: {rows: [], row_desc: []}}
    callback = (error, data) => {
      expect(error).to.be.null
      expect(data.results).to.deep.equal([])
      expect(data.timing).to.deep.equal({
        execution_time_ms: 2,
        total_time_ms: 1
      })
      done()
    }
    processQueryResults(logging, updateQueryTimes)(options, _datumEnum, result, callback)
  })
})
