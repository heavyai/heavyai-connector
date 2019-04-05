"use strict"
const isNodeRuntime = typeof window === "undefined"
const expect = isNodeRuntime ? require("chai").expect : window.expect
const convertToDataUrl = isNodeRuntime
  ? require("base64-arraybuffer").encode
  : x => x
const Connector = isNodeRuntime
  ? require("../dist/node-connector.js")
  : window.MapdCon

const imageRegex = /^iVBOR/
// An empty image data url will have about 80 header chars, then repeat 12 chars till it ends with a roughly 35 char footer.
// A full image data url will have the same header and footer, but will have non-repeated sequences in the middle.
// Note that \1 substitutes in the value of the first capture group (the 12 chars).
const emptyImageRegex = /^.{70,90}(.{12})\1+.{30,50}$/

describe(isNodeRuntime ? "node" : "browser", () => {
  let connector
  beforeEach(() => {
    connector = new Connector()
      .protocol("https")
      .host("metis.mapd.com")
      .port("443")
      .dbName("mapd")
      .user("mapd")
      .password("HyperInteractive")
  })

  const widgetId = 0
  const options = {}
  const vega = JSON.stringify({
    // vega must be a JSON-parsable string
    width: 384,
    height: 541,
    data: [
      {
        name: "points",
        sql:
          "SELECT conv_4326_900913_x(dest_lon) as x,conv_4326_900913_y(dest_lat) as y,flights_donotmodify.rowid FROM flights_donotmodify WHERE (dest_lon >= -129.54651698345356 AND dest_lon <= -69.63578696483647) AND (dest_lat >= -4.65308173226758 AND dest_lat <= 62.077009825854276) AND MOD(flights_donotmodify.rowid * 265445761, 4294967296) < 70879699 LIMIT 2000000"
      }
    ],
    scales: [
      {
        name: "x",
        type: "linear",
        domain: [-14421052.30266158, -7751820.344850887],
        range: "width"
      },
      {
        name: "y",
        type: "linear",
        domain: [-518549.0024222817, 8877426.229827026],
        range: "height"
      }
    ],
    marks: [
      {
        type: "points",
        from: { data: "points" },
        properties: {
          x: { scale: "x", field: "x" },
          y: { scale: "y", field: "y" },
          size: 10,
          fillColor: "#27aeef"
        }
      }
    ]
  })

  it(".connect", done => {
    connector.connect((connectError, session) => {
      expect(connectError).not.be.an("error")
      expect(session).to.respondTo("query")
      done()
    })
  })

  it(".disconnect", done => {
    connector.connect((connectError, session) => {
      expect(connectError).to.not.be.an("error")
      session.disconnect(disconnectError => {
        expect(disconnectError).not.be.an("error")
        expect(session.getStatus).to.throw() // example use of disconnected client should fail
        done()
      })
    })
  })

  it(".getTablesAsync", done => {
    connector.connect((connectError, session) => {
      expect(connectError).to.not.be.an("error")
      session
        .getTablesAsync()
        .then(data => {
          expect(data).to.deep.equal([
            { name: "flights_donotmodify", label: "obs" },
            { name: "contributions_donotmodify", label: "obs" },
            { name: "tweets_nov_feb", label: "obs" },
            { name: "zipcodes", label: "obs" }
          ])
          done()
        })
        .catch(getTablesAsyncError => {
          expect(getTablesAsyncError).to.not.be.an("error")
          done()
        })
    })
  })

  it(".getFields", done => {
    connector.connect((connectError, session) => {
      expect(connectError).to.not.be.an("error")
      session.getFields("flights_donotmodify", (getFieldsError, data) => {
        expect(getFieldsError).to.not.be.an("error")
        expect(data).to.deep.equal([
          {
            is_array: false,
            is_dict: false,
            name: "flight_year",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "flight_month",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "flight_dayofmonth",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "flight_dayofweek",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "deptime",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "crsdeptime",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "arrtime",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "crsarrtime",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "uniquecarrier",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "flightnum",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "tailnum",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "actualelapsedtime",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "crselapsedtime",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "airtime",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "arrdelay",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "depdelay",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "origin",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "dest",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "distance",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "taxiin",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "taxiout",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "cancelled",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "cancellationcode",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "diverted",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "carrierdelay",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "weatherdelay",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "nasdelay",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "securitydelay",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "lateaircraftdelay",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "dep_timestamp",
            type: "TIMESTAMP",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "arr_timestamp",
            type: "TIMESTAMP",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "carrier_name",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "plane_type",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "plane_manufacturer",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "plane_issue_date",
            type: "DATE",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "plane_model",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "plane_status",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "plane_aircraft_type",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "plane_engine_type",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "plane_year",
            type: "SMALLINT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "origin_name",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "origin_city",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "origin_state",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "origin_country",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "origin_lat",
            type: "FLOAT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "origin_lon",
            type: "FLOAT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "dest_name",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "dest_city",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "dest_state",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: true,
            name: "dest_country",
            type: "STR",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "dest_lat",
            type: "FLOAT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "dest_lon",
            type: "FLOAT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "origin_merc_x",
            type: "FLOAT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "origin_merc_y",
            type: "FLOAT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "dest_merc_x",
            type: "FLOAT",
            precision: 0
          },
          {
            is_array: false,
            is_dict: false,
            name: "dest_merc_y",
            type: "FLOAT",
            precision: 0
          }
        ])
        done()
      })
    })
  })

  it(".query", done => {
    const sql = "SELECT count(*) AS n FROM tweets_nov_feb WHERE country='CO'"
    connector.connect((connectError, session) => {
      expect(connectError).to.not.be.an("error")
      session.query(sql, options, (error, data) => {
        expect(error).not.be.an("error")
        expect(Number(data[0].n)).to.equal(6400)
        done()
      })
    })
  })

  it(".render", done => {
    connector.connect((connectError, session) => {
      expect(connectError).to.not.be.an("error")
      session.renderVega(widgetId, vega, options, (renderVegaError, data) => {
        expect(renderVegaError).to.not.be.an("error")
        const imageData = convertToDataUrl(data.image)
        expect(imageData, "should be a image data URL").to.match(imageRegex)
        expect(imageData, "shouldn't be an empty image").to.not.match(
          emptyImageRegex
        )
        done()
      })
    })
  })

  it(".getResultRowForPixel", done => {
    const pixel = { x: 70, y: 275 }
    const tableColNamesMap = { points: ["dest_lon"] } // {vegaDataLayerName: [columnFromDataLayerTable]}
    connector.connect((connectError, session) => {
      expect(connectError).to.not.be.an("error")
      session.renderVega(widgetId, vega, options, renderVegaError => {
        expect(renderVegaError).to.not.be.an("error")
        session.getResultRowForPixel(
          widgetId,
          pixel,
          tableColNamesMap,
          2,
          (pixelError, data) => {
            expect(pixelError).to.not.be.an("error")
            const lon = data[0].row_set[0].dest_lon
            expect(lon).to.be.within(-119.056770325, -119.056770323) // Ran 100 times; seems deterministic.
            done()
          }
        )
      })
    })
  })

  if (isNodeRuntime) {
    // bug only applies to node; in browser thriftTransportInstance is undefined.
    it("on bad arguments: passes error, flushes internal buffer so next RPC doesn't fail, dereferences callback to avoid memory leak", done => {
      const BAD_ARG = {}
      const callback = () => {
        /* noop */
      }
      connector.connect((_, session) => {
        expect(() => session.getFields(BAD_ARG, callback)).to.throw(
          "writeString called without a string/Buffer argument: [object Object]"
        )
        const thriftClient = connector._client[0]
        const thriftTransportInstance = thriftClient.output
        expect(thriftTransportInstance.outCount).to.equal(0)
        expect(thriftTransportInstance.outBuffers).to.deep.equal([])
        expect(thriftTransportInstance._seqid).to.equal(null)
        expect(thriftClient._reqs[thriftClient._seqid]).to.equal(null)
        done()
      })
    })
  }
})
