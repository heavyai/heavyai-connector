"use strict"
const hostname = process.env.HOSTNAME || "metis.mapd.com"
const protocol = process.env.PROTOCOL || "https"
const port = process.env.PORT || "443"
const database = process.env.DATABASE || "heavyai"
const username = process.env.USERNAME || "admin"
const password = process.env.PASSWORD || "HyperInteractive"

const isNodeRuntime = typeof window === "undefined"
const expect = isNodeRuntime ? require("chai").expect : window.expect
const convertToDataUrl = isNodeRuntime
  ? require("base64-arraybuffer").encode
  : (x) => x
const Connector = isNodeRuntime
  ? require("../dist/node-connector.js").DbCon
  : window.DbCon

const imageRegex = /^iVBOR/
// An empty image data url will have about 80 header chars, then repeat 12 chars till it ends with a roughly 35 char footer.
// A full image data url will have the same header and footer, but will have non-repeated sequences in the middle.
// Note that \1 substitutes in the value of the first capture group (the 12 chars).
const emptyImageRegex = /^.{70,90}(.{12})\1+.{30,50}$/

describe(isNodeRuntime ? "node" : "browser", () => {
  const connector = new Connector()
    .protocol(protocol)
    .host(hostname)
    .port(port)
    .dbName(database)
    .user(username)
    .password(password)
  let session

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

  it(".connect", (done) => {
    connector.connect((connectError, sess) => {
      session = sess
      expect(connectError).not.be.an("error")
      expect(sess).to.respondTo("query")
      done()
    })
  })

  it(".getTablesAsync", (done) => {
    session
      .getTablesAsync()
      .then((data) => {
        expect(data).to.not.be.empty
        done()
      })
      .catch((getTablesAsyncError) => {
        expect(getTablesAsyncError).to.not.be.an("error")
        done()
      })
  })

  it(".loadTableBinaryColumnarAsync", (done) => {
    session
      .loadTableBinaryColumnarAsync()
      .then((data) => {
        expect(data).to.not.be.empty
        done()
      })
      .catch((loadTableBinaryColumnarAsyncError) => {
        expect(loadTableBinaryColumnarAsyncError).to.not.be.an("error")
        done()
      })
  })

  it(".getDashboardsAsync", (done) => {
    session
      .getDashboardsAsync()
      // eslint-disable-next-line max-nested-callbacks
      .then((data) => {
        // The `update_time` field is too volatile to rely on for unit tests, so strip it out
        const dataNoUpdateTime = data.map((d) =>
          Object.assign({}, d, { update_time: null })
        )
        expect(dataNoUpdateTime).to.not.be.empty
        done()
      })
      // eslint-disable-next-line max-nested-callbacks
      .catch((getDashboardsAsyncError) => {
        expect(getDashboardsAsyncError).to.not.be.an("error")
        done()
      })
  })

  it(".getFields", (done) => {
    session.getFields("flights_donotmodify", (getFieldsError, data) => {
      expect(getFieldsError).to.not.be.an("error")
      expect(data.view_sql).to.be.a("string")
      expect(data.columns).to.deep.equal([
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

  it(".query", (done) => {
    const sql =
      "SELECT count(*) AS n FROM flights_donotmodify WHERE weatherdelay > 500"
    session.query(sql, options, (error, data) => {
      expect(error).not.be.an("error")
      expect(Number(data[0].n)).to.equal(156)
      done()
    })
  })

  it(".render", (done) => {
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

  it(".getResultRowForPixel", (done) => {
    const pixel = { x: 70, y: 275 }
    const tableColNamesMap = { points: ["dest_lon"] } // {vegaDataLayerName: [columnFromDataLayerTable]}
    session.renderVega(widgetId, vega, options, (renderVegaError) => {
      expect(renderVegaError).to.not.be.an("error")
      session.getResultRowForPixel(
        widgetId,
        pixel,
        tableColNamesMap,
        2,
        (pixelError, data) => {
          expect(pixelError).to.not.be.an("error")
          const lon = data[0].row_set[0].dest_lon
          expect(lon).to.be.eq(-117.82951354980469)
          done()
        }
      )
    })
  })

  it(".disconnect", (done) => {
    session.disconnect((disconnectError) => {
      expect(disconnectError).not.be.an("error")
      done()
    })
  })
})
