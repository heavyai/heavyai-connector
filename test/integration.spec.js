"use strict"
/* eslint-disable no-unused-expressions */
/* eslint-disable max-nested-callbacks */
/* eslint-disable no-magic-numbers */
const isNodeRuntime = typeof window === "undefined"
const expect = isNodeRuntime ? require("chai").expect : window.expect
const convertToDataUrl = isNodeRuntime ? require("base64-arraybuffer").encode : x => x
const Connector = isNodeRuntime ? require("../dist/node-connector.js") : window.Connector

const imageRegex = /^iVBOR/
// An empty image data url will have about 80 header chars, then repeat 12 chars till it ends with a roughly 35 char footer.
// A full image data url will have the same header and footer, but will have non-repeated sequences in the middle.
// Note that \1 substitutes in the value of the first capture group (the 12 chars).
const emptyImageRegex = /^.{70,90}(.{12})\1+.{30,50}$/

describe(`${isNodeRuntime ? "node" : "browser"} Connector`, () => {
  it(".connect success", done => {
    new Connector().protocol("https").host("metis.mapd.com").port("443").dbName("mapd").user("mapd").password("HyperInteractive")
    .connect((error, session) => {
      expect(error).not.be.an.error
      expect(session).to.be.an.instanceOf(Connector)
      expect(session).to.respondTo("query")
      done()
    })
  })

  it(".connect error", done => {
    new Connector().password("invalid password").protocol("https").host("metis.mapd.com").port("443").dbName("mapd").user("mapd")
    .connect((error, session) => {
      expect(error).to.be.an.error
      expect(error.message).to.equal("TMapDException Password for User mapd is incorrect.")
      expect(session).to.be.undefined
      done()
    })
  })
})

describe(`${isNodeRuntime ? "node" : "browser"} Connector session`, () => {
  const vega = JSON.stringify({ // vega must be a JSON-parsable string
    width: 384,
    height: 541,
    data: [{
      name: "points",
      sql: "SELECT conv_4326_900913_x(dest_lon) as x,conv_4326_900913_y(dest_lat) as y,flights_donotmodify.rowid FROM flights_donotmodify WHERE (dest_lon >= -129.54651698345356 AND dest_lon <= -69.63578696483647) AND (dest_lat >= -4.65308173226758 AND dest_lat <= 62.077009825854276) AND MOD(flights_donotmodify.rowid * 265445761, 4294967296) < 70879699 LIMIT 2000000"
    }],
    scales: [{
      name: "x",
      type: "linear",
      domain: [-14421052.30266158, -7751820.344850887],
      range: "width"
    }, {
      name: "y",
      type: "linear",
      domain: [-518549.0024222817, 8877426.229827026],
      range: "height"
    }],
    marks: [{
      type: "points",
      from: {data: "points"},
      properties: {
        x: {scale: "x", field: "x"},
        y: {scale: "y", field: "y"},
        size: 10,
        fillColor: "#27aeef"
      }
    }]
  })

  let session = null
  beforeEach(done => {
    new Connector().protocol("https").host("metis.mapd.com").port("443").dbName("mapd").user("mapd").password("HyperInteractive")
    .connect((error, newSession) => {
      expect(error).not.be.an.error
      session = newSession
      done()
    })
  })

  it(".disconnect success", done => {
    expect(session.sessionId()).not.to.be.null
    session.disconnect((error, newSession) => {
      expect(error).not.be.an.error
      expect(newSession).to.be.an.instanceOf(Connector)
      expect(newSession.sessionId()).to.be.null
      done()
    })
  })

  it(".getFrontendView success", done => {
    session.getFrontendView("__E2E_NUMBER_CHART__DO_NOT_MODIFY__", (error, data) => {
      expect(error).to.be.null
      expect(JSON.parse(JSON.stringify(data))).to.deep.equal({ // parse stringify because some hidden prop fails deep equals.
        view_name: "__E2E_NUMBER_CHART__DO_NOT_MODIFY__",
        view_state: "eyJjaGFydHMiOnsiMCI6eyJkY0ZsYWciOjF9LCIxIjp7ImFyZUZpbHRlcnNJbnZlcnNlIjpmYWxzZSwiYmluUGFyYW1zIjpudWxsLCJjYXAiOjEyLCJjb2xvciI6eyJ0eXBlIjoic29saWQiLCJrZXkiOiJibHVlIiwidmFsIjpbIiMyN2FlZWYiXX0sImNvbG9yRG9tYWluIjpudWxsLCJkY0ZsYWciOjQsImRpbWVuc2lvbnMiOltdLCJlbGFzdGljWCI6dHJ1ZSwiZmlsdGVycyI6W10sImdlb0pzb24iOm51bGwsImhlaWdodCI6bnVsbCwibG9hZGluZyI6ZmFsc2UsIm1lYXN1cmVzIjpbeyJpc0Vycm9yIjpmYWxzZSwiaXNSZXF1aXJlZCI6ZmFsc2UsInRhYmxlIjoiZmxpZ2h0c19kb25vdG1vZGlmeSIsInR5cGUiOiJTTUFMTElOVCIsImlzX2FycmF5IjpmYWxzZSwiaXNfZGljdCI6ZmFsc2UsIm5hbWVfaXNfYW1iaWd1b3VzIjpmYWxzZSwibGFiZWwiOiJ0YXhpb3V0IiwidmFsdWUiOiJ0YXhpb3V0IiwiY29sb3JUeXBlIjoicXVhbnRpdGF0aXZlIiwiYWdnVHlwZSI6IkF2ZyIsImN1c3RvbSI6ZmFsc2UsIm9yaWdpbkluZGV4IjowLCJuYW1lIjoidmFsIiwiaW5hY3RpdmUiOmZhbHNlfV0sIm9yZGVyaW5nIjoiZGVzYyIsIm90aGVyc0dyb3VwZXIiOmZhbHNlLCJzYXZlZENvbG9ycyI6e30sInNvcnRDb2x1bW4iOnsiY29sIjp7Im5hbWUiOiJjb3VudHZhbCJ9LCJpbmRleCI6MSwib3JkZXIiOiJkZXNjIn0sInRpY2tzIjozLCJ0aW1lQmluSW5wdXRWYWwiOiIiLCJ0aXRsZSI6IiIsInR5cGUiOiJudW1iZXIiLCJ3aWR0aCI6bnVsbCwiaGFzRXJyb3IiOmZhbHNlfX0sInVpIjp7InNob3dGaWx0ZXJQYW5lbCI6ZmFsc2UsInNob3dDbGVhckZpbHRlcnNEcm9wZG93biI6ZmFsc2UsIm1vZGFsIjp7Im9wZW4iOmZhbHNlLCJjb250ZW50IjoiIiwiaGVhZGVyIjoiIiwiY2FuY2VsQnV0dG9uIjpmYWxzZX0sInNlbGVjdG9yUGlsbEhvdmVyIjp7InNob3VsZFNob3dQcm9tcHQiOmZhbHNlLCJtZXNzYWdlIjoiIiwidG9wIjowfSwic2VsZWN0b3JQb3NpdGlvbnMiOnsiZGltZW5zaW9ucyI6WzExMCwxMDYsMTUwLDExMCwxMTBdLCJtZWFzdXJlcyI6WzE5OSwxOTksMjM5LDI3OSwxOTUsMjM5LDE5OV19fSwiZmlsdGVycyI6W10sImRhc2hib2FyZCI6eyJ0aXRsZSI6Il9fRTJFX05VTUJFUl9DSEFSVF9fRE9fTk9UX01PRElGWV9fIiwiY2hhcnRDb250YWluZXJzIjpbeyJpZCI6IjEifV0sInRhYmxlIjoiZmxpZ2h0c19kb25vdG1vZGlmeSIsImZpbHRlcnNJZCI6W10sImxheW91dCI6W3sidyI6MTAsImgiOjEwLCJ4IjowLCJ5IjowLCJpIjoiMSIsIm1vdmVkIjpmYWxzZSwic3RhdGljIjpmYWxzZX1dLCJzYXZlTGlua1N0YXRlIjp7ImVycm9yIjpmYWxzZSwicmVxdWVzdCI6ZmFsc2UsInNhdmVMaW5rSWQiOm51bGx9LCJsb2FkU3RhdGUiOnsiZXJyb3IiOmZhbHNlLCJyZXF1ZXN0IjpmYWxzZSwibG9hZExpbmtJZCI6bnVsbH0sInNhdmVTdGF0ZSI6eyJlcnJvciI6ZmFsc2UsInJlcXVlc3QiOmZhbHNlLCJsYXN0U3RhdGUiOm51bGwsImlzU2F2ZWQiOmZhbHNlfX19",
        image_hash: "",
        update_time: "2016-10-15T05:32:44Z",
        view_metadata: "{\"table\":\"flights_donotmodify\",\"version\":\"v2\"}"
      })
      done()
    })
  })

  it(".getFrontendViews success", done => {
    session.getFrontendViews((error, data) => {
      expect(error).to.be.null
      expect(JSON.parse(JSON.stringify(data))).to.deep.equal([ // parse stringify because some hidden prop fails deep equals.
        {
          image_hash: "",
          update_time: "2016-10-15T05:44:20Z",
          view_metadata: "{\"table\":\"flights_donotmodify\",\"version\":\"v2\"}",
          view_name: "__E2E_LINE_CHART_BRUSH__DO_NOT_MODIFY__",
          view_state: ""
        }, {
          image_hash: "",
          update_time: "2016-10-15T05:40:39Z",
          view_metadata: "{\"table\":\"flights_donotmodify\",\"version\":\"v2\"}",
          view_name: "__E2E_MULTI_BIN_DIM_HEATMAP_FILTER__DO_NOT_MODIFY__",
          view_state: ""
        }, {
          image_hash: "",
          update_time: "2016-10-15T05:32:44Z",
          view_metadata: "{\"table\":\"flights_donotmodify\",\"version\":\"v2\"}",
          view_name: "__E2E_NUMBER_CHART__DO_NOT_MODIFY__",
          view_state: ""
        }, {
          image_hash: "",
          update_time: "2016-10-15T05:55:33Z",
          view_metadata: "{\"table\":\"contributions_donotmodify\",\"version\":\"v2\"}",
          view_name: "__E2E__ALL_CHARTS__DO_NOT_MODIFY__",
          view_state: ""
        }
      ])
      done()
    })
  })

  it(".getServerStatus success", done => {
    session.getServerStatus((error, data) => {
      expect(error).to.be.null
      expect(Object.keys(data).sort()).to.deep.equal(["edition", "read_only", "rendering_enabled", "start_time", "version"])
      expect(data.edition).to.be.null
      expect(data.read_only).to.equal(true)
      expect(data.rendering_enabled).to.equal(true)
      expect(Number(data.start_time)).to.be.a.number // timestamp likely to change
      expect(isNaN(data.start_time)).to.equal(false) // timestamp likely to change
      expect(data.version).to.be.a.string // version likely to change
      done()
    })
  })

  xit(".createFrontendView success")

  xit(".deleteFrontendView success")

  xit(".createLink success")

  it(".getLinkView success", done => {
    const link = "1563954d"
    session.getLinkView(link, (error, data) => {
      expect(error).to.be.null
      expect(JSON.parse(JSON.stringify(data))).to.deep.equal({ // parse stringify because some hidden prop fails deep equals.
        view_name: "1563954d",
        view_state: "eyJjaGFydHMiOnsiMCI6eyJkY0ZsYWciOjF9LCIxIjp7ImFyZUZpbHRlcnNJbnZlcnNlIjpmYWxzZSwiYmluUGFyYW1zIjpudWxsLCJjYXAiOjEyLCJjb2xvciI6eyJ0eXBlIjoic29saWQiLCJrZXkiOiJibHVlIiwidmFsIjpbIiMyN2FlZWYiXX0sImNvbG9yRG9tYWluIjpudWxsLCJkaW1lbnNpb25zIjpbXSwiZWxhc3RpY1giOnRydWUsImZpbHRlcnMiOltdLCJnZW9Kc29uIjpudWxsLCJoZWlnaHQiOm51bGwsImxvYWRpbmciOmZhbHNlLCJtZWFzdXJlcyI6W3siaXNFcnJvciI6ZmFsc2UsImlzUmVxdWlyZWQiOmZhbHNlLCJ0YWJsZSI6ImZsaWdodHNfZG9ub3Rtb2RpZnkiLCJ0eXBlIjoiU01BTExJTlQiLCJpc19hcnJheSI6ZmFsc2UsImlzX2RpY3QiOmZhbHNlLCJuYW1lX2lzX2FtYmlndW91cyI6ZmFsc2UsImxhYmVsIjoidGF4aW91dCIsInZhbHVlIjoidGF4aW91dCIsImNvbG9yVHlwZSI6InF1YW50aXRhdGl2ZSIsImFnZ1R5cGUiOiJBdmciLCJjdXN0b20iOmZhbHNlLCJvcmlnaW5JbmRleCI6MCwibmFtZSI6InZhbCIsImluYWN0aXZlIjpmYWxzZX1dLCJvdGhlcnNHcm91cGVyIjpmYWxzZSwic2F2ZWRDb2xvcnMiOnt9LCJzb3J0Q29sdW1uIjp7ImNvbCI6eyJuYW1lIjoiY291bnR2YWwifSwiaW5kZXgiOjEsIm9yZGVyIjoiZGVzYyJ9LCJ0aWNrcyI6MywidGltZUJpbklucHV0VmFsIjoiIiwidGl0bGUiOiIiLCJ0eXBlIjoibnVtYmVyIiwid2lkdGgiOm51bGwsImhhc0Vycm9yIjpmYWxzZSwic2hvd051bGxEaW1lbnNpb25zIjpmYWxzZSwicmFuZ2VGaWx0ZXIiOltdLCJkY0ZsYWciOjJ9fSwidWkiOnsic2VsZWN0b3JQb3NpdGlvbnMiOnsiZGltZW5zaW9ucyI6WzExMCwxMDYsMTUwLDExMCwxMTBdLCJtZWFzdXJlcyI6WzE5OSwxOTksMjM5LDI3OSwxOTUsMjM5LDE5OV19LCJzaG93RmlsdGVyUGFuZWwiOmZhbHNlLCJzaG93Q2xlYXJGaWx0ZXJzRHJvcGRvd24iOmZhbHNlLCJtb2RhbCI6eyJvcGVuIjpmYWxzZSwiY29udGVudCI6IiIsImhlYWRlciI6IiIsImNhbmNlbEJ1dHRvbiI6ZmFsc2V9LCJzZWxlY3RvclBpbGxIb3ZlciI6eyJzaG91bGRTaG93UHJvbXB0IjpmYWxzZSwibWVzc2FnZSI6IiIsInRvcCI6MH19LCJmaWx0ZXJzIjpbXSwiZGFzaGJvYXJkIjp7InRpdGxlIjoiX19FMkVfTlVNQkVSX0NIQVJUX19ET19OT1RfTU9ESUZZX18iLCJjaGFydENvbnRhaW5lcnMiOlt7ImlkIjoiMSJ9XSwidGFibGUiOiJmbGlnaHRzX2Rvbm90bW9kaWZ5IiwiZmlsdGVyc0lkIjpbXSwibGF5b3V0IjpbeyJ3IjoxMCwiaCI6MTAsIngiOjAsInkiOjAsImkiOiIxIiwibW92ZWQiOmZhbHNlLCJzdGF0aWMiOmZhbHNlfV0sInNhdmVMaW5rU3RhdGUiOnsiZXJyb3IiOmZhbHNlLCJyZXF1ZXN0IjpmYWxzZSwic2F2ZUxpbmtJZCI6bnVsbH0sImxvYWRTdGF0ZSI6eyJyZXF1ZXN0IjpmYWxzZSwiZXJyb3IiOmZhbHNlfSwic2F2ZVN0YXRlIjp7ImlzU2F2ZWQiOmZhbHNlLCJyZXF1ZXN0IjpmYWxzZSwiZXJyb3IiOmZhbHNlfSwiaW5pdGlhbGl6YXRpb24iOnsiZG9uZSI6ZmFsc2UsInBlbmRpbmciOmZhbHNlLCJlcnJvciI6ZmFsc2UsImNvdW50ZXIiOjB9LCJ2ZXJzaW9uIjoiMy4wLjAtMjAxNzA1MDItOWU1YmE5NSJ9fQ==",
        image_hash: "",
        update_time: "2017-06-25T05:29:11Z",
        view_metadata: ""
      })
      done()
    })
  })

  it(".getLinkView error", done => {
    const link = "BAD"
    session.getLinkView(link, (error, data) => {
      expect(error).to.be.an.error
      expect(error.message).to.equal("TMapDException Link BAD is not valid.")
      expect(data).to.be.undefined
      done()
    })
  })

  xit(".detectColumnTypes success", done => { // TODO Can this be done without the file locally? What are valid copyParams?
    const fileName = "test.csv"
    const copyParams = {}
    session.detectColumnTypes(fileName, copyParams, (error, data) => {
      expect(error).to.be.null
      expect(data).to.deep.equal([])
      done()
    })
  })

  it(".query success", done => {
    const sql = "SELECT count(*) AS n FROM tweets_nov_feb WHERE country='CO'"
    const options = {}
    session.query(sql, options, (error, data) => {
      expect(error).not.be.an.error
      expect(Number(data[0].n)).to.equal(6400)
      done()
    })
  })

  it(".query error", done => {
    const sql = "invalid sql"
    const options = {}
    session.query(sql, options, (error, data) => {
      expect(error).to.be.an.error
      expect(error.message).to.equal("TMapDException Exception: ERROR-- Parse failed: line 1, column 1, Non-query expression encountered in illegal context")
      expect(data).to.be.undefined
      done()
    })
  })

  it(".validateQuery success", done => {
    const sql = "SELECT count(*) AS n FROM tweets_nov_feb WHERE country='CO'"
    session.validateQuery(sql, (error, data) => {
      expect(error).not.be.an.error
      expect(data).to.deep.equal([{name: "n", type: "INT", is_array: false, is_dict: false}])
      done()
    })
  })

  it(".validateQuery error", done => {
    const sql = "invalid sql"
    session.validateQuery(sql, (error, data) => {
      expect(error).to.be.an.error
      expect(error.message).to.equal("TMapDException Exception: ERROR-- Parse failed: line 1, column 1, Non-query expression encountered in illegal context")
      expect(data).to.be.undefined
      done()
    })
  })

  it(".getTables success", done => {
    session.getTables((getTablesError, data) => {
      expect(getTablesError).to.not.be.an.error
      expect(data).to.deep.equal([
        {name: "flights_donotmodify", label: "obs"},
        {name: "contributions_donotmodify", label: "obs"},
        {name: "tweets_nov_feb", label: "obs"},
        {name: "zipcodes", label: "obs"}
      ])
      done()
    })
  })

  xit(".getTables error")

  it(".getFields success", done => {
    session.getFields("flights_donotmodify", (getFieldsError, data) => {
      expect(getFieldsError).to.not.be.an.error
      expect(data).to.deep.equal([
        {is_array: false, is_dict: false, name: "flight_year", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "flight_month", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "flight_dayofmonth", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "flight_dayofweek", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "deptime", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "crsdeptime", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "arrtime", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "crsarrtime", type: "SMALLINT"},
        {is_array: false, is_dict: true, name: "uniquecarrier", type: "STR"},
        {is_array: false, is_dict: false, name: "flightnum", type: "SMALLINT"},
        {is_array: false, is_dict: true, name: "tailnum", type: "STR"},
        {is_array: false, is_dict: false, name: "actualelapsedtime", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "crselapsedtime", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "airtime", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "arrdelay", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "depdelay", type: "SMALLINT"},
        {is_array: false, is_dict: true, name: "origin", type: "STR"},
        {is_array: false, is_dict: true, name: "dest", type: "STR"},
        {is_array: false, is_dict: false, name: "distance", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "taxiin", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "taxiout", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "cancelled", type: "SMALLINT"},
        {is_array: false, is_dict: true, name: "cancellationcode", type: "STR"},
        {is_array: false, is_dict: false, name: "diverted", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "carrierdelay", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "weatherdelay", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "nasdelay", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "securitydelay", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "lateaircraftdelay", type: "SMALLINT"},
        {is_array: false, is_dict: false, name: "dep_timestamp", type: "TIMESTAMP"},
        {is_array: false, is_dict: false, name: "arr_timestamp", type: "TIMESTAMP"},
        {is_array: false, is_dict: true, name: "carrier_name", type: "STR"},
        {is_array: false, is_dict: true, name: "plane_type", type: "STR"},
        {is_array: false, is_dict: true, name: "plane_manufacturer", type: "STR"},
        {is_array: false, is_dict: false, name: "plane_issue_date", type: "DATE"},
        {is_array: false, is_dict: true, name: "plane_model", type: "STR"},
        {is_array: false, is_dict: true, name: "plane_status", type: "STR"},
        {is_array: false, is_dict: true, name: "plane_aircraft_type", type: "STR"},
        {is_array: false, is_dict: true, name: "plane_engine_type", type: "STR"},
        {is_array: false, is_dict: false, name: "plane_year", type: "SMALLINT"},
        {is_array: false, is_dict: true, name: "origin_name", type: "STR"},
        {is_array: false, is_dict: true, name: "origin_city", type: "STR"},
        {is_array: false, is_dict: true, name: "origin_state", type: "STR"},
        {is_array: false, is_dict: true, name: "origin_country", type: "STR"},
        {is_array: false, is_dict: false, name: "origin_lat", type: "FLOAT"},
        {is_array: false, is_dict: false, name: "origin_lon", type: "FLOAT"},
        {is_array: false, is_dict: true, name: "dest_name", type: "STR"},
        {is_array: false, is_dict: true, name: "dest_city", type: "STR"},
        {is_array: false, is_dict: true, name: "dest_state", type: "STR"},
        {is_array: false, is_dict: true, name: "dest_country", type: "STR"},
        {is_array: false, is_dict: false, name: "dest_lat", type: "FLOAT"},
        {is_array: false, is_dict: false, name: "dest_lon", type: "FLOAT"},
        {is_array: false, is_dict: false, name: "origin_merc_x", type: "FLOAT"},
        {is_array: false, is_dict: false, name: "origin_merc_y", type: "FLOAT"},
        {is_array: false, is_dict: false, name: "dest_merc_x", type: "FLOAT"},
        {is_array: false, is_dict: false, name: "dest_merc_y", type: "FLOAT"}
      ])
      done()
    })
  })

  it(".getFields error", done => {
    session.getFields("NOT A TABLE", (error, data) => {
      expect(error).to.be.an.error
      expect(error.message).to.equal("TMapDException Table doesn't exist")
      expect(data).to.be.undefined
      done()
    })
  })

  xit(".createTable success")

  xit(".importTable success")

  xit(".importShapeTable success")

  it(".renderVega success", done => {
    const widgetId = 0
    const options = {}
    session.renderVega(widgetId, vega, options, (renderVegaError, data) => {
      expect(renderVegaError).to.not.be.an.error
      const imageData = convertToDataUrl(data.image)
      expect(imageData, "should be a image data URL").to.match(imageRegex)
      expect(imageData, "shouldn't be an empty image").to.not.match(emptyImageRegex)
      done()
    })
  })

  it(".renderVega error", done => {
    const widgetId = 0
    const options = {}
    const badVega = "BAD"
    session.renderVega(widgetId, badVega, options, (error, data) => {
      expect(error).to.be.an.error
      expect(error.message).to.equal("TMapDException Exception: /home/jenkins-slave/workspace/mapd2-multi/compiler/gcc/gpu/cuda/host/centos/render/render/QueryRenderer/QueryRenderer.cpp:164 JSON parse error: json offset: 0, error: Invalid value.")
      expect(data).to.be.undefined
      done()
    })
  })

  it(".getPixel success", done => {
    const widgetId = 0
    const options = {}
    const pixel = {x: 70, y: 275}
    const tableColNamesMap = {points: ["dest_lon"]}
    session.renderVega(widgetId, vega, options, renderVegaError => {
      expect(renderVegaError).to.not.be.an.error
      session.getPixel(widgetId, pixel, tableColNamesMap, (pixelError, data) => {
        expect(pixelError).to.not.be.an.error
        expect(data[0].row_set).to.deep.equal([{dest_lon: -119.056770324707}]) // Ran 100 times; seems deterministic.
        done()
      })
    })
  })

  it(".getPixel success empty", done => {
    const widgetId = 0
    const options = {}
    const pixelWithNoResults = {x: 0, y: 0}
    const tableColNamesMap = {points: ["dest_lon"]}
    session.renderVega(widgetId, vega, options, renderVegaError => {
      expect(renderVegaError).to.not.be.an.error
      session.getPixel(widgetId, pixelWithNoResults, tableColNamesMap, (pixelError, data) => {
        expect(pixelError).to.not.be.an.error
        expect(data[0].row_set).to.deep.equal([])
        done()
      })
    })
  })

  xit(".getPixel error unrendered", done => { // TODO should throw rather than succeed empty
    const widgetId = -947647 // not rendered
    const pixel = {x: 70, y: 275}
    const tableColNamesMap = {points: ["dest_lon"]}
    session.getPixel(widgetId, pixel, tableColNamesMap, (error, data) => {
      expect(error).to.be.an.error
      expect(error.message).to.equal("TMapDException no vega rendered for id -947647.")
      expect(data).to.be.undefined
      done()
    })
  })

  it(".getPixel error", done => {
    const widgetId = 0
    const options = {}
    const pixel = {x: 70, y: 275}
    const badTableColNamesMap = {points: ["NOT_A_COLUMN"]}
    session.renderVega(widgetId, vega, options, renderVegaError => {
      expect(renderVegaError).to.not.be.an.error
      session.getPixel(widgetId, pixel, badTableColNamesMap, (pixelError, data) => {
        expect(pixelError).to.be.an.error
        expect(pixelError.message).to.equal("TMapDException Exception: TException - service has thrown: TMapDException(error_msg=Exception: ERROR-- Validate failed: From line 1, column 8 to line 1, column 21: Column 'NOT_A_COLUMN' not found in any table)")
        expect(data).to.be.undefined
        done()
      })
    })
  })

  if (isNodeRuntime) { // bug only applies to node; in browser thriftTransportInstance is undefined.
    it("on bad arguments: passes error, flushes internal buffer so next RPC doesn't fail, dereferences callback to avoid memory leak", () => {
      const BAD_ARG = {}
      expect(() => session.getFields(BAD_ARG, () => {
        const thriftClient = session._client[0]
        const thriftTransportInstance = thriftClient.output
        expect(thriftTransportInstance.outCount).to.equal(0)
        expect(thriftTransportInstance.outBuffers).to.deep.equal([])
        expect(thriftTransportInstance._seqid).to.equal(null)
        expect(thriftClient._reqs[thriftClient._seqid]).to.equal(null)
      })).to.throw("writeString called without a string/Buffer argument: [object Object]")
    })
  }
})
