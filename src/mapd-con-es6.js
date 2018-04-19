const { TDatumType, TEncodingType, TPixel } =
  (isNodeRuntime() && require("../build/thrift/node/mapd_types.js")) || window // eslint-disable-line global-require
const MapDThrift =
  isNodeRuntime() && require("../build/thrift/node/mapd.thrift.js") // eslint-disable-line global-require
let Thrift = (isNodeRuntime() && require("thrift")) || window.Thrift // eslint-disable-line global-require
const thriftWrapper = Thrift
const parseUrl = isNodeRuntime() && require("url").parse // eslint-disable-line global-require
if (isNodeRuntime()) {
  // Because browser Thrift and Node Thrift are exposed slightly differently.
  Thrift = Thrift.Thrift
  Thrift.Transport = thriftWrapper.TBufferedTransport
  Thrift.Protocol = thriftWrapper.TJSONProtocol
}
import * as helpers from "./helpers"
import MapDClientV2 from "./mapd-client-v2"
import processQueryResults from "./process-query-results"

const COMPRESSION_LEVEL_DEFAULT = 3

function arrayify(maybeArray) {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray]
}

function isNodeRuntime() {
  return typeof window === "undefined"
}

class MapdCon {
  constructor() {
    this._host = null
    this._user = null
    this._password = null
    this._port = null
    this._dbName = null
    this._client = null
    this._sessionId = null
    this._protocol = null
    this._datumEnum = {}
    this._logging = false
    this._platform = "mapd"
    this._nonce = 0
    this._balanceStrategy = "adaptive"
    this._numConnections = 0
    this._lastRenderCon = 0
    this.queryTimes = {}
    this.serverQueueTimes = null
    this.serverPingTimes = null
    this.pingCount = null
    this.DEFAULT_QUERY_TIME = 50
    this.NUM_PINGS_PER_SERVER = 4
    this.importerRowDesc = null

    // invoke initialization methods
    this.invertDatumTypes()

    this.processResults = (options = {}, result, callback) => {
      const processor = processQueryResults(
        this._logging,
        this.updateQueryTimes
      )
      const processResultsObject = processor(
        options,
        this._datumEnum,
        result,
        callback
      )
      return processResultsObject
    }

    // return this to allow chaining off of instantiation
    return this
  }

  /**
   * Create a connection to the server, generating a client and session id.
   * @param {Function} callback A callback that takes `(err, success)` as its signature.  Returns con singleton on success.
   * @return {MapdCon} Object
   *
   * @example <caption>Connect to a MapD server:</caption>
   * var con = new MapdCon()
   *   .host('localhost')
   *   .port('8080')
   *   .dbName('myDatabase')
   *   .user('foo')
   *   .password('bar')
   *   .connect((err, con) => console.log(con.sessionId()));
   *
   *   // ["om9E9Ujgbhl6wIzWgLENncjWsaXRDYLy"]
   */
  connect(callback) {
    if (this._sessionId) {
      this.disconnect()
    }

    // TODO: should be its own function
    const allAreArrays =
      Array.isArray(this._host) &&
      Array.isArray(this._port) &&
      Array.isArray(this._user) &&
      Array.isArray(this._password) &&
      Array.isArray(this._dbName)
    if (!allAreArrays) {
      return callback("All connection parameters must be arrays.")
    }

    this._client = []
    this._sessionId = []

    if (!this._user[0]) {
      return callback("Please enter a username.")
    } else if (!this._password[0]) {
      return callback("Please enter a password.")
    } else if (!this._dbName[0]) {
      return callback("Please enter a database.")
    } else if (!this._host[0]) {
      return callback("Please enter a host name.")
    } else if (!this._port[0]) {
      return callback("Please enter a port.")
    }

    // now check to see if length of all arrays are the same and > 0
    const hostLength = this._host.length
    if (hostLength < 1) {
      return callback("Must have at least one server to connect to.")
    }
    if (
      hostLength !== this._port.length ||
      hostLength !== this._user.length ||
      hostLength !== this._password.length ||
      hostLength !== this._dbName.length
    ) {
      return callback("Array connection parameters must be of equal length.")
    }

    if (!this._protocol) {
      this._protocol = this._host.map(() =>
        window.location.protocol.replace(":", "")
      )
    }

    const transportUrls = this.getEndpoints()
    for (let h = 0; h < hostLength; h++) {
      let client = null

      if (isNodeRuntime()) {
        const { protocol, hostname, port } = parseUrl(transportUrls[h])
        const connection = thriftWrapper.createHttpConnection(hostname, port, {
          transport: thriftWrapper.TBufferedTransport,
          protocol: thriftWrapper.TJSONProtocol,
          path: "/",
          headers: { Connection: "close" },
          https: protocol === "https:"
        })
        connection.on("error", console.error) // eslint-disable-line no-console
        client = thriftWrapper.createClient(MapDThrift, connection)
        resetThriftClientOnArgumentErrorForMethods(this, client, [
          "connect",
          "createFrontendViewAsync",
          "createLinkAsync",
          "createTableAsync",
          "dbName",
          "deleteFrontendViewAsync",
          "detectColumnTypesAsync",
          "disconnect",
          "getCompletionHintsAsync",
          "getFields",
          "getFrontendViewAsync",
          "getFrontendViewsAsync",
          "getLinkViewAsync",
          "getResultRowForPixel",
          "getServerStatusAsync",
          "getStatusAsync",
          "getTablesAsync",
          "getTablesWithMetaAsync",
          "host",
          "importTableAsync",
          "importTableGeoAsync",
          "logging",
          "password",
          "port",
          "protocol",
          "query",
          "renderVega",
          "sessionId",
          "user",
          "validateQuery"
        ])
      } else {
        const thriftTransport = new Thrift.Transport(transportUrls[h])
        const thriftProtocol = new Thrift.Protocol(thriftTransport)
        client = new MapDClientV2(thriftProtocol)
      }

      client.connect(
        this._user[h],
        this._password[h],
        this._dbName[h],
        (error, sessionId) => {
          if (error) {
            callback(error)
            return
          }
          this._client.push(client)
          this._sessionId.push(sessionId)
          this._numConnections = this._client.length
          callback(null, this)
        }
      )
    }

    return this
  }

  convertFromThriftTypes(fields) {
    const fieldsArray = []
    // silly to change this from map to array
    // - then later it turns back to map
    for (const key in fields) {
      if (fields.hasOwnProperty(key)) {
        fieldsArray.push({
          name: key,
          type: this._datumEnum[fields[key].col_type.type],
          is_array: fields[key].col_type.is_array,
          is_dict: fields[key].col_type.encoding === TEncodingType.DICT // eslint-disable-line no-undef
        })
      }
    }
    return fieldsArray
  }

  /**
   * Disconnect from the server then clears the client and session values.
   * @return {MapdCon} Object
   * @param {Function} callback A callback that takes `(err, success)` as its signature.  Returns con singleton on success.
   *
   * @example <caption>Disconnect from the server:</caption>
   *
   * con.sessionId() // ["om9E9Ujgbhl6wIzWgLENncjWsaXRDYLy"]
   * con.disconnect((err, con) => console.log(err, con))
   * con.sessionId() === null;
   */
  disconnect(callback) {
    if (this._sessionId !== null) {
      for (let c = 0; c < this._client.length; c++) {
        this._client[c].disconnect(this._sessionId[c], error => {
          // Success will return NULL

          if (error) {
            return callback(error, this)
          }
          this._sessionId = null
          this._client = null
          this._numConnections = 0
          this.serverPingTimes = null
          return callback(null, this)
        })
      }
    }
    return this
  }

  updateQueryTimes = (
    conId,
    queryId,
    estimatedQueryTime,
    execution_time_ms
  ) => {
    this.queryTimes[queryId] = execution_time_ms
  }

  getFrontendViews = callback => {
    if (this._sessionId) {
      this._client[0].get_frontend_views(this._sessionId[0], callback)
    } else {
      callback(new Error("No Session ID"))
    }
  }

  /**
   * Get the recent dashboards as a list of <code>TFrontendView</code> objects.
   * These objects contain a value for the <code>view_name</code> property,
   * but not for the <code>view_state</code> property.
   * @return {Promise<TFrontendView[]>} An array which has all saved dashboards.
   *
   * @example <caption>Get the list of dashboards from the server:</caption>
   *
   * con.getFrontendViewsAsync().then((results) => console.log(results))
   * // [TFrontendView, TFrontendView]
   */
  getFrontendViewsAsync = () =>
    new Promise((resolve, reject) => {
      this.getFrontendViews((error, views) => {
        if (error) {
          reject(error)
        } else {
          resolve(views)
        }
      })
    })

  getFrontendView = (viewName, callback) => {
    if (this._sessionId && viewName) {
      this._client[0].get_frontend_view(this._sessionId[0], viewName, callback)
    } else {
      callback(new Error("No Session ID"))
    }
  }

  /**
   * Get a dashboard object containing a value for the <code>view_state</code> property.
   * This object contains a value for the <code>view_state</code> property,
   * but not for the <code>view_name</code> property.
   * @param {String} viewName the name of the dashboard
   * @return {Promise.<Object>} An object that contains all data and metadata related to the dashboard
   *
   * @example <caption>Get a specific dashboard from the server:</caption>
   *
   * con.getFrontendViewAsync('dashboard_name').then((result) => console.log(result))
   * // {TFrontendView}
   */
  getFrontendViewAsync = viewName =>
    new Promise((resolve, reject) => {
      this.getFrontendView(viewName, (err, view) => {
        if (err) {
          reject(err)
        } else {
          resolve(view)
        }
      })
    })

  getStatus = callback => {
    this._client[0].get_status(this._sessionId[0], callback)
  }

  /**
   * Get the status of the server as a <code>TServerStatus</code> object.
   * This includes whether the server is read-only,
   * has backend rendering enabled, and the version number.
   * @return {Promise.<Object>}
   *
   * @example <caption>Get the server status:</caption>
   *
   * con.getServerStatusAsync().then((result) => console.log(result))
   * // {
   * //   "read_only": false,
   * //   "version": "3.0.0dev-20170503-40e2de3",
   * //   "rendering_enabled": true,
   * //   "start_time": 1493840131
   * // }
   */

  getServerStatusAsync = () => {
    console.warn(
      "getServerStatusAsync is deprecated, please use getStatusAsync"
    )
    return new Promise((resolve, reject) => {
      this.getStatus((err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result[0])
        }
      })
    })
  }

  /**
   * Get the status of the server as an array of <code>TServerStatus</code> objects.
   * This includes whether the server is read-only,
   * has backend rendering enabled, and the version number.
   * @return {Promise.<Object>}
   *
   * @example <caption>Get the server status:</caption>
   *
   * con.getStatusAsync().then((result) => console.log(result))
   * // [{
   * //   "read_only": false,
   * //   "version": "3.0.0dev-20170503-40e2de3",
   * //   "rendering_enabled": true,
   * //   "start_time": 1493840131
   * // }]
   */

  getStatusAsync = () =>
    new Promise((resolve, reject) => {
      this.getStatus((err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })

  getHardwareInfo = callback => {
    this._client[0].get_hardware_info(this._sessionId[0], callback)
  }

  /**
   * Get some info about the hardware
   * - Number of GPUs
   * - Number of GPUs allocated to MapD
   * - Start GPU
   * - Number of SMs or SMx or CU (They simply mean streaming multi processors)
   * - Clock frequency of each GPUs
   * - Physical Memory of each GPU
   * - Compute capability of each GPU
   * @return {Promise.<Object>}
   *
   * @example <caption>Get harddware info:</caption>
   *
   * con.getHardwareInfoAsync().then((result) => console.log(result))
   * {
   *   "hardware_info": [{
   *    "num_gpu_hw": 2,
   *      "num_cpu_hw": 12,
   *      "num_gpu_allocated": 2,
   *      "start_gpu": 0,
   *      "host_name": "",
   *      "gpu_info": [{
   *          "num_sm": 28,
   *          "clock_frequency_kHz": 1531000,
   *          "memory": 12781682688,
   *          "compute_capability_major": 6,
   *          "compute_capability_minor": 1
   *      }, {
   *          "num_sm": 28,
   *          "clock_frequency_kHz": 1531000,
   *          "memory": 12782075904,
   *          "compute_capability_major": 6,
   *          "compute_capability_minor": 1
   *      }]
   *   }]
   * }
   */

  getHardwareInfoAsync = () =>
    new Promise((resolve, reject) => {
      this.getHardwareInfo((err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })

  /**
   * Add a new dashboard to the server.
   * @param {String} viewName - the name of the new dashboard
   * @param {String} viewState - the base64-encoded state string of the new dashboard
   * @param {String} imageHash - the numeric hash of the dashboard thumbnail
   * @param {String} metaData - Stringified metaData related to the view
   * @return {Promise} Returns empty if success
   *
   * @example <caption>Add a new dashboard to the server:</caption>
   *
   * con.createFrontendViewAsync('newSave', 'viewstateBase64', null, 'metaData').then(res => console.log(res))
   */
  createFrontendViewAsync(viewName, viewState, imageHash, metaData) {
    if (!this._sessionId) {
      return new Promise((resolve, reject) => {
        reject(
          new Error(
            "You are not connected to a server. Try running the connect method first."
          )
        )
      })
    }

    return Promise.all(
      this._client.map(
        (client, i) =>
          new Promise((resolve, reject) => {
            client.create_frontend_view(
              this._sessionId[i],
              viewName,
              viewState,
              imageHash,
              metaData,
              (error, data) => {
                if (error) {
                  reject(error)
                } else {
                  resolve(data)
                }
              }
            )
          })
      )
    )
  }

  deleteFrontendView(viewName, callback) {
    if (!this._sessionId) {
      throw new Error(
        "You are not connected to a server. Try running the connect method first."
      )
    }
    try {
      this._client.forEach((client, i) => {
        // do we want to try each one individually so if we fail we keep going?
        client.delete_frontend_view(this._sessionId[i], viewName, callback)
      })
    } catch (err) {
      console.log(
        "ERROR: Could not delete the frontend view. Check your session id.",
        err
      )
    }
  }

  /**
   * Delete a dashboard object containing a value for the <code>view_state</code> property.
   * @param {String} viewName - the name of the dashboard
   * @return {Promise.<String>} Name of dashboard successfully deleted
   *
   * @example <caption>Delete a specific dashboard from the server:</caption>
   *
   * con.deleteFrontendViewAsync('dashboard_name').then(res => console.log(res))
   */
  deleteFrontendViewAsync = viewName =>
    new Promise((resolve, reject) => {
      this.deleteFrontendView(viewName, err => {
        if (err) {
          reject(err)
        } else {
          resolve(viewName)
        }
      })
    })

  /**
   * Create a short hash to make it easy to share a link to a specific dashboard.
   * @param {String} viewState - the base64-encoded state string of the new dashboard
   * @param {String} metaData - Stringified metaData related to the link
   * @return {Promise.<String[]>} link - A short hash of the dashboard used for URLs
   *
   * @example <caption>Create a link to the current state of a dashboard:</caption>
   *
   * con.createLinkAsync("eyJuYW1lIjoibXlkYXNoYm9hcmQifQ==", 'metaData').then(res => console.log(res));
   * // ["28127951"]
   */
  createLinkAsync(viewState, metaData) {
    return Promise.all(
      this._client.map(
        (client, i) =>
          new Promise((resolve, reject) => {
            client.create_link(
              this._sessionId[i],
              viewState,
              metaData,
              (error, data) => {
                if (error) {
                  reject(error)
                } else {
                  const result = data.split(",").reduce((links, link) => {
                    if (links.indexOf(link) === -1) {
                      links.push(link)
                    }
                    return links
                  }, [])
                  if (!result || result.length !== 1) {
                    reject(
                      new Error("Different links were created on connection")
                    )
                  } else {
                    resolve(result.join())
                  }
                }
              }
            )
          })
      )
    )
  }

  getLinkView = (link, callback) => {
    this._client[0].get_link_view(this._sessionId[0], link, callback)
  }

  /**
   * Get a fully-formed dashboard object from a generated share link.
   * This object contains the given link for the <code>view_name</code> property,
   * @param {String} link - the short hash of the dashboard, see {@link createLink}
   * @return {Promise.<Object>} Object of the dashboard and metadata
   *
   * @example <caption>Get a dashboard from a link:</caption>
   *
   * con.getLinkViewAsync('28127951').then(res => console.log(res))
   * //  {
   * //    "view_name": "28127951",
   * //    "view_state": "eyJuYW1lIjoibXlkYXNoYm9hcmQifQ==",
   * //    "image_hash": "",
   * //    "update_time": "2017-04-28T21:34:01Z",
   * //    "view_metadata": "metaData"
   * //  }
   */
  getLinkViewAsync = link =>
    new Promise((resolve, reject) => {
      this.getLinkView(link, (err, theLink) => {
        if (err) {
          reject(err)
        } else {
          resolve(theLink)
        }
      })
    })

  detectColumnTypes(fileName, copyParams, callback) {
    const thriftCopyParams = helpers.convertObjectToThriftCopyParams(copyParams)
    this._client[0].detect_column_types(
      this._sessionId[0],
      fileName,
      thriftCopyParams,
      callback
    )
  }

  /**
   * Asynchronously get the data from an importable file,
   * such as a .csv or plaintext file with a header.
   * @param {String} fileName - the name of the importable file
   * @param {TCopyParams} copyParams - see {@link TCopyParams}
   * @returns {Promise.<TDetectResult>} An object which has copy_params and row_set
   *
   * @example <caption>Get data from table_data.csv:</caption>
   *
   * var copyParams = new TCopyParams();
   * con.detectColumnTypesAsync('table_data.csv', copyParams).then(res => console.log(res))
   * // TDetectResult {row_set: TRowSet, copy_params: TCopyParams}
   *
   */
  detectColumnTypesAsync(fileName, copyParams) {
    return new Promise((resolve, reject) => {
      this.detectColumnTypes.bind(this, fileName, copyParams)((err, res) => {
        if (err) {
          reject(err)
        } else {
          this.importerRowDesc = res.row_set.row_desc
          resolve(res)
        }
      })
    })
  }

  /**
   * Submit a query to the database and process the results.
   * @param {String} query The query to perform
   * @param {Object} options the options for the query
   * @param {Function} callback that takes `(err, result) => result`
   * @returns {Object} The result of the query
   *
   * @example <caption>create a query</caption>
   *
   * var query = "SELECT count(*) AS n FROM tweets_nov_feb WHERE country='CO'";
   * var options = {};
   *
   * con.query(query, options, function(err, result) {
   *        console.log(result)
   *      });
   *
   */
  query(query, options, callback) {
    let columnarResults = true
    let eliminateNullRows = false
    let queryId = null
    let returnTiming = false
    let limit = -1
    if (options) {
      columnarResults = options.hasOwnProperty("columnarResults")
        ? options.columnarResults
        : columnarResults
      eliminateNullRows = options.hasOwnProperty("eliminateNullRows")
        ? options.eliminateNullRows
        : eliminateNullRows
      queryId = options.hasOwnProperty("queryId") ? options.queryId : queryId
      returnTiming = options.hasOwnProperty("returnTiming")
        ? options.returnTiming
        : returnTiming
      limit = options.hasOwnProperty("limit") ? options.limit : limit
    }

    const lastQueryTime =
      queryId in this.queryTimes
        ? this.queryTimes[queryId]
        : this.DEFAULT_QUERY_TIME

    const curNonce = (this._nonce++).toString()

    const conId = 0

    const processResultsOptions = {
      returnTiming,
      eliminateNullRows,
      query,
      queryId,
      conId,
      estimatedQueryTime: lastQueryTime
    }

    try {
      const AT_MOST_N = -1
      if (callback) {
        this._client[conId].sql_execute(
          this._sessionId[conId],
          query,
          columnarResults,
          curNonce,
          limit,
          AT_MOST_N,
          (error, result) => {
            if (error) {
              callback(error)
            } else {
              this.processResults(processResultsOptions, result, callback)
            }
          }
        )
        return curNonce
      } else if (!callback) {
        const SQLExecuteResult = this._client[conId].sql_execute(
          this._sessionId[conId],
          query,
          columnarResults,
          curNonce,
          limit,
          AT_MOST_N
        )
        return this.processResults(processResultsOptions, SQLExecuteResult)
      }
    } catch (err) {
      if (err.name === "NetworkError") {
        this.removeConnection(conId)
        if (this._numConnections === 0) {
          err.msg = "No remaining database connections"
          throw err
        }
        this.query(query, options, callback)
      } else if (callback) {
        callback(err)
      } else {
        throw err
      }
    }
  }

  /** @deprecated will default to query */
  queryAsync = this.query

  /**
   * Submit a query to validate whether the backend can create a result set based on the SQL statement.
   * @param {String} query The query to perform
   * @returns {Promise.<Object>} The result of whether the query is valid
   *
   * @example <caption>create a query</caption>
   *
   * var query = "SELECT count(*) AS n FROM tweets_nov_feb WHERE country='CO'";
   *
   * con.validateQuery(query).then(res => console.log(res))
   *
   * // [{
   * //    "name": "n",
   * //    "type": "INT",
   * //    "is_array": false,
   * //    "is_dict": false
   * //  }]
   *
   */
  validateQuery(query) {
    return new Promise((resolve, reject) => {
      this._client[0].sql_validate(this._sessionId[0], query, (error, res) => {
        if (error) {
          reject(error)
        } else {
          resolve(this.convertFromThriftTypes(res))
        }
      })
    })
  }

  removeConnection(conId) {
    if (conId < 0 || conId >= this.numConnections) {
      const err = {
        msg: "Remove connection id invalid"
      }
      throw err
    }
    this._client.splice(conId, 1)
    this._sessionId.splice(conId, 1)
    this._numConnections--
  }

  getTables(callback) {
    this._client[0].get_tables(this._sessionId[0], (error, tables) => {
      if (error) {
        callback(error)
      } else {
        callback(
          null,
          tables.map(table => ({
            name: table,
            label: "obs"
          }))
        )
      }
    })
  }

  /**
   * Get the names of the tables that exist on the current session's connection.
   * @return {Promise.<Object[]>} list of table objects containing the label and table names.
   *
   * @example <caption>Get the list of tables from a connection:</caption>
   *
   *  con.getTablesAsync().then(res => console.log(res))
   *
   *  //  [{
   *  //    label: 'obs', // deprecated property
   *  //    name: 'myTableName'
   *  //   },
   *  //  ...]
   */
  getTablesAsync() {
    return new Promise((resolve, reject) => {
      this.getTables.bind(this)((error, tables) => {
        if (error) {
          reject(error)
        } else {
          resolve(tables)
        }
      })
    })
  }

  getTablesWithMeta(callback) {
    this._client[0].get_tables_meta(this._sessionId[0], (error, tables) => {
      if (error) {
        callback(error)
      } else {
        callback(
          null,
          tables.map(table => ({
            name: table.table_name,
            num_cols: Number(table.num_cols.toString()),
            col_datum_types: table.col_datum_types.map(type => this._datumEnum[type]),
            is_view: table.is_view,
            is_replicated: table.is_replicated,
            shard_count: Number(table.shard_count.toString()),
            max_rows: isFinite(table.max_rows)
              ? Number(table.max_rows.toString())
              : -1
          }))
        )
      }
    })
  }

  /**
   * Get names and catalog metadata for tables that exist on the current session's connection.
   * @return {Promise.<Object[]>} list of objects containing table metadata.
   *
   * @example <caption>Get the list of tables with metadata from a connection:</caption>
   *
   *  con.getTablesWithMetaAsync().then(res => console.log(res))
   *
   *  [
   *   {
   *    name: 'my_table_name',
   *    col_datum_types: [TDatumType::BOOL, TDatumType::DOUBLE],
   *    is_view: false,
   *    is_replicated: false,
   *    shard_count: 0,
   *    max_rows: -1
   *   },
   *  ...]
   */
  getTablesWithMetaAsync() {
    return new Promise((resolve, reject) => {
      this.getTablesWithMeta.bind(this)((error, tables) => {
        if (error) {
          reject(error)
        } else {
          resolve(tables)
        }
      })
    })
  }

  /**
   * Submits a sql string to the backend and returns a completion hints object
   * @param {String} queryString a fragment of SQL input
   * @param {Object} options an options object continaing the current cursor position, 1-indexed from the start of queryString
   * @param {Function} callback a callback function with the signature `(err, result) => result`
   * @returns {Array} An array of completion hints objects that contains the completion hints
   *
   * @example
   * const queryString = "f";
   * const cursor = 1;
   *
   * con.getCompletionHints(queryString, cursor, function(error, result) {
   *        console.log(result)
   *      });
   *
   *  [{
   *    hints: ["FROM"],
   *    replaced: "f",
   *    type: 7
   *   }]
   *
   */
  getCompletionHints(queryString, options, callback) {
    const cursor = options.cursor
    this._client[0].get_completion_hints(
      this._sessionId[0],
      queryString,
      cursor,
      (error, result) => {
        if (error) {
          callback(error)
        } else {
          callback(null, result)
        }
      }
    )
  }

  /**
   * Create an array-like object from {@link TDatumType} by
   * flipping the string key and numerical value around.
   *
   * @returns {Undefined} This function does not return anything
   */
  invertDatumTypes() {
    const datumType = TDatumType // eslint-disable-line no-undef
    for (const key in datumType) {
      if (datumType.hasOwnProperty(key)) {
        this._datumEnum[datumType[key]] = key
      }
    }
  }

  /**
   * Get a list of field objects for a given table.
   * @param {String} tableName - name of table containing field names
   * @param {Function} callback - (err, results)
   * @return {Array<Object>} fields - the formmatted list of field objects
   *
   * @example <caption>Get the list of fields from a specific table:</caption>
   *
   * con.getFields('flights', (err, res) => console.log(res))
   * // [{
   *   name: 'fieldName',
   *   type: 'BIGINT',
   *   is_array: false,
   *   is_dict: false
   * }, ...]
   */
  getFields(tableName, callback) {
    this._client[0].get_table_details(
      this._sessionId[0],
      tableName,
      (error, fields) => {
        if (fields) {
          const rowDict = fields.row_desc.reduce((accum, value) => {
            accum[value.col_name] = value
            return accum
          }, {})
          callback(null, this.convertFromThriftTypes(rowDict))
        } else {
          callback(new Error("Table (" + tableName + ") not found" + error))
        }
      }
    )
  }

  createTable(tableName, rowDescObj, tableType, callback) {
    if (!this._sessionId) {
      throw new Error(
        "You are not connected to a server. Try running the connect method first."
      )
    }

    const thriftRowDesc = helpers.mutateThriftRowDesc(
      rowDescObj,
      this.importerRowDesc
    )

    for (let c = 0; c < this._numConnections; c++) {
      this._client[c].create_table(
        this._sessionId[c],
        tableName,
        thriftRowDesc,
        tableType,
        err => {
          if (err) {
            callback(err)
          } else {
            callback()
          }
        }
      )
    }
  }

  /**
   * Create a table and persist it to the backend.
   * @param {String} tableName - desired name of the new table
   * @param {Array<TColumnType>} rowDescObj - fields of the new table
   * @param {Number<TTableType>} tableType - the types of tables a user can import into the db
   * @return {Promise.<undefined>} it will either catch an error or return undefined on success
   *
   * @example <caption>Create a new table:</caption>
   *
   *  con.createTable('mynewtable', [TColumnType, TColumnType, ...], 0).then(res => console.log(res));
   *  // undefined
   */
  createTableAsync = (tableName, rowDescObj, tableType) =>
    new Promise((resolve, reject) => {
      this.createTable(tableName, rowDescObj, tableType, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })

  importTable(
    tableName,
    fileName,
    copyParams,
    rowDescObj,
    isShapeFile,
    callback
  ) {
    if (!this._sessionId) {
      throw new Error(
        "You are not connected to a server. Try running the connect method first."
      )
    }

    const thriftCopyParams = helpers.convertObjectToThriftCopyParams(copyParams)
    const thriftRowDesc = helpers.mutateThriftRowDesc(
      rowDescObj,
      this.importerRowDesc
    )

    const thriftCallBack = (err, res) => {
      if (err) {
        callback(err)
      } else {
        callback(null, res)
      }
    }

    for (let c = 0; c < this._numConnections; c++) {
      if (isShapeFile) {
        this._client[c].import_geo_table(
          this._sessionId[c],
          tableName,
          fileName,
          thriftCopyParams,
          thriftRowDesc,
          thriftCallBack
        )
      } else {
        this._client[c].import_table(
          this._sessionId[c],
          tableName,
          fileName,
          thriftCopyParams,
          thriftCallBack
        )
      }
    }
  }

  importTableAsyncWrapper(isShapeFile) {
    return (tableName, fileName, copyParams, headers) =>
      new Promise((resolve, reject) => {
        this.importTable(
          tableName,
          fileName,
          copyParams,
          headers,
          isShapeFile,
          (err, link) => {
            if (err) {
              reject(err)
            } else {
              resolve(link)
            }
          }
        )
      })
  }

  /**
   * Import a delimited table from a file.
   * @param {String} tableName - desired name of the new table
   * @param {String} fileName
   * @param {TCopyParams} copyParams - see {@link TCopyParams}
   * @param {TColumnType[]} headers -- a colleciton of metadata related to the table headers
   */
  importTableAsync = this.importTableAsyncWrapper(false)

  /**
   * Import a geo table from a file.
   * @param {String} tableName - desired name of the new table
   * @param {String} fileName
   * @param {TCopyParams} copyParams - see {@link TCopyParams}
   * @param {TColumnType[]} headers -- a colleciton of metadata related to the table headers
   */
  importTableGeoAsync = this.importTableAsyncWrapper(true)

  /**
   * Use for backend rendering. This method will fetch a PNG image
   * that is a render of the vega json object.
   *
   * @param {Number} widgetid the widget id of the calling widget
   * @param {String} vega the vega json
   * @param {Object} options the options for the render query
   * @param {Number} options.compressionLevel the png compression level.
   *                  range 1 (low compression, faster) to 10 (high compression, slower).
   *                  Default 3.
   * @param {Function} callback takes `(err, success)` as its signature.  Returns con singleton on success.
   *
   * @returns {Image} Base 64 Image
   */
  renderVega(widgetid, vega, options, callback) /* istanbul ignore next */ {
    let queryId = null
    let compressionLevel = COMPRESSION_LEVEL_DEFAULT
    if (options) {
      queryId = options.hasOwnProperty("queryId") ? options.queryId : queryId
      compressionLevel = options.hasOwnProperty("compressionLevel")
        ? options.compressionLevel
        : compressionLevel
    }

    const lastQueryTime =
      queryId in this.queryTimes
        ? this.queryTimes[queryId]
        : this.DEFAULT_QUERY_TIME

    const curNonce = (this._nonce++).toString()

    const conId = 0
    this._lastRenderCon = conId

    const processResultsOptions = {
      isImage: true,
      query: "render: " + vega,
      queryId,
      conId,
      estimatedQueryTime: lastQueryTime
    }

    try {
      if (!callback) {
        const renderResult = this._client[conId].render_vega(
          this._sessionId[conId],
          widgetid,
          vega,
          compressionLevel,
          curNonce
        )
        return this.processResults(processResultsOptions, renderResult)
      }

      this._client[conId].render_vega(
        this._sessionId[conId],
        widgetid,
        vega,
        compressionLevel,
        curNonce,
        (error, result) => {
          if (error) {
            callback(error)
          } else {
            this.processResults(processResultsOptions, result, callback)
          }
        }
      )
    } catch (err) {
      throw err
    }

    return curNonce
  }

  /**
   * Used primarily for backend rendered maps, this method will fetch the row
   * for a specific table that was last rendered at a pixel.
   *
   * @param {widgetId} Number - the widget id of the caller
   * @param {TPixel} pixel - the pixel (lower left-hand corner is pixel (0,0))
   * @param {String} tableName - the table containing the geo data
   * @param {Object} tableColNamesMap - object of tableName -> array of col names
   * @param {Array<Function>} callbacks
   * @param {Number} [pixelRadius=2] - the radius around the primary pixel to search
   */

  getResultRowForPixel(
    widgetId,
    pixel,
    tableColNamesMap,
    callbacks,
    pixelRadius = 2
  ) /* istanbul ignore next */ {
    if (!(pixel instanceof TPixel)) {
      pixel = new TPixel(pixel)
    }
    const columnFormat = true // BOOL
    const curNonce = (this._nonce++).toString()
    try {
      if (!callbacks) {
        return this.processPixelResults(
          undefined, // eslint-disable-line no-undefined
          this._client[this._lastRenderCon].get_result_row_for_pixel(
            this._sessionId[this._lastRenderCon],
            widgetId,
            pixel,
            tableColNamesMap,
            columnFormat,
            pixelRadius,
            curNonce
          )
        )
      }
      this._client[this._lastRenderCon].get_result_row_for_pixel(
        this._sessionId[this._lastRenderCon],
        widgetId,
        pixel,
        tableColNamesMap,
        columnFormat,
        pixelRadius,
        curNonce,
        this.processPixelResults.bind(this, callbacks)
      )
    } catch (err) {
      throw err
    }
    return curNonce
  }

  /**
   * Formats the pixel results into the same pattern as textual results.
   *
   * @param {Array<Function>} callbacks a collection of callbacks
   * @param {Object} error an error if one was thrown, otherwise null
   * @param {Array|Object} results unformatted results of pixel rowId information
   *
   * @returns {Object} An object with the pixel results formatted for display
   */
  processPixelResults(callbacks, error, results) {
    callbacks = Array.isArray(callbacks) ? callbacks : [callbacks]
    results = Array.isArray(results) ? results.pixel_rows : [results]
    if (error) {
      if (callbacks) {
        callbacks.pop()(error, results)
      } else {
        throw new Error(
          `Unable to process result row for pixel results: ${error}`
        )
      }
    }
    const numPixels = results.length
    const processResultsOptions = {
      isImage: false,
      eliminateNullRows: false,
      query: "pixel request",
      queryId: -2
    }
    for (let p = 0; p < numPixels; p++) {
      results[p].row_set = this.processResults(
        processResultsOptions,
        results[p]
      )
    }
    if (!callbacks) {
      return results
    }
    callbacks.pop()(error, results)
  }

  /**
   * Get or set the session ID used by the server to serve the correct data.
   * This is typically set by {@link connect} and should not be set manually.
   * @param {Number} sessionId - The session ID of the current connection
   * @return {Number|MapdCon} - The session ID or the MapdCon itself
   *
   * @example <caption>Get the session id:</caption>
   *
   *  con.sessionId();
   * // sessionID === 3145846410
   *
   * @example <caption>Set the session id:</caption>
   * var con = new MapdCon().connect().sessionId(3415846410);
   * // NOTE: It is generally unsafe to set the session id manually.
   */
  sessionId(sessionId) {
    if (!arguments.length) {
      return this._sessionId
    }
    this._sessionId = sessionId
    return this
  }

  /**
   * Get or set the connection server hostname.
   * This is is typically the first method called after instantiating a new MapdCon.
   * @param {String} host - The hostname address
   * @return {String|MapdCon} - The hostname or the MapdCon itself
   *
   * @example <caption>Set the hostname:</caption>
   * var con = new MapdCon().host('localhost');
   *
   * @example <caption>Get the hostname:</caption>
   * var host = con.host();
   * // host === 'localhost'
   */
  host(host) {
    if (!arguments.length) {
      return this._host
    }
    this._host = arrayify(host)
    return this
  }

  /**
   * Get or set the connection port.
   * @param {String} port - The port to connect on
   * @return {String|MapdCon} - The port or the MapdCon itself
   *
   * @example <caption>Set the port:</caption>
   * var con = new MapdCon().port('8080');
   *
   * @example <caption>Get the port:</caption>
   * var port = con.port();
   * // port === '8080'
   */
  port(port) {
    if (!arguments.length) {
      return this._port
    }
    this._port = arrayify(port)
    return this
  }

  /**
   * Get or set the username to authenticate with.
   * @param {String} user - The username to authenticate with
   * @return {String|MapdCon} - The username or the MapdCon itself
   *
   * @example <caption>Set the username:</caption>
   * var con = new MapdCon().user('foo');
   *
   * @example <caption>Get the username:</caption>
   * var username = con.user();
   * // user === 'foo'
   */
  user(user) {
    if (!arguments.length) {
      return this._user
    }
    this._user = arrayify(user)
    return this
  }

  /**
   * Get or set the user's password to authenticate with.
   * @param {String} password - The password to authenticate with
   * @return {String|MapdCon} - The password or the MapdCon itself
   *
   * @example <caption>Set the password:</caption>
   * var con = new MapdCon().password('bar');
   *
   * @example <caption>Get the username:</caption>
   * var password = con.password();
   * // password === 'bar'
   */
  password(password) {
    if (!arguments.length) {
      return this._password
    }
    this._password = arrayify(password)
    return this
  }

  /**
   * Get or set the name of the database to connect to.
   * @param {String} dbName - The database to connect to
   * @return {String|MapdCon} - The name of the database or the MapdCon itself
   *
   * @example <caption>Set the database name:</caption>
   * var con = new MapdCon().dbName('myDatabase');
   *
   * @example <caption>Get the database name:</caption>
   * var dbName = con.dbName();
   * // dbName === 'myDatabase'
   */
  dbName(dbName) {
    if (!arguments.length) {
      return this._dbName
    }
    this._dbName = arrayify(dbName)
    return this
  }

  /**
   * Whether the raw queries strings will be logged to the console.
   * Used primarily for debugging and defaults to <code>false</code>.
   * @param {Boolean} logging - Set to true to enable logging
   * @return {Boolean|MapdCon} - The current logging flag or MapdCon itself
   *
   * @example <caption>Set logging to true:</caption>
   * var con = new MapdCon().logging(true);
   *
   * @example <caption>Get the logging flag:</caption>
   * var isLogging = con.logging();
   * // isLogging === true
   */
  logging(logging) {
    if (typeof logging === "undefined") {
      return this._logging
    } else if (typeof logging !== "boolean") {
      return "logging can only be set with boolean values"
    }
    this._logging = logging
    const isEnabledTxt = logging ? "enabled" : "disabled"
    return `SQL logging is now ${isEnabledTxt}`
  }

  /**
   * The name of the platform.
   * @param {String} platform - The platform, default is "mapd"
   * @return {String|MapdCon} - The platform or the MapdCon itself
   *
   * @example <caption>Set the platform name:</caption>
   * var con = new MapdCon().platform('myPlatform');
   *
   * @example <caption>Get the platform name:</caption>
   * var platform = con.platform();
   * // platform === 'myPlatform'
   */
  platform(platform) {
    if (!arguments.length) {
      return this._platform
    }
    this._platform = platform
    return this
  }

  /**
   * Get the number of connections that are currently open.
   * @return {Number} - number of open connections
   *
   * @example <caption>Get the number of connections:</caption>
   *
   * var numConnections = con.numConnections();
   * // numConnections === 1
   */
  numConnections() {
    return this._numConnections
  }

  /**
   * The protocol to use for requests.
   * @param {String} protocol - http or https
   * @return {String|MapdCon} - protocol or MapdCon itself
   *
   * @example <caption>Set the protocol:</caption>
   * var con = new MapdCon().protocol('http');
   *
   * @example <caption>Get the protocol:</caption>
   * var protocol = con.protocol();
   * // protocol === 'http'
   */
  protocol(protocol) {
    if (!arguments.length) {
      return this._protocol
    }
    this._protocol = arrayify(protocol)
    return this
  }

  /**
   * Generates a list of endpoints from the connection params.
   * @return {Array<String>} - list of endpoints
   *
   * @example <caption>Get the endpoints:</caption>
   * var con = new MapdCon().protocol('http').host('localhost').port('8000');
   * var endpoints = con.getEndpoints();
   * // endpoints === [ 'http://localhost:8000' ]
   */
  getEndpoints() {
    return this._host.map(
      (host, i) => this._protocol[i] + "://" + host + ":" + this._port[i]
    )
  }
}

function resetThriftClientOnArgumentErrorForMethods(
  connector,
  client,
  methodNames
) {
  methodNames.forEach(methodName => {
    const oldFunc = connector[methodName]
    connector[methodName] = (...args) => {
      try {
        // eslint-disable-line no-restricted-syntax
        return oldFunc.apply(connector, args) // TODO should reject rather than throw for Promises.
      } catch (e) {
        // `this.output` is the Thrift transport instance
        client.output.outCount = 0
        client.output.outBuffers = []
        client.output._seqid = null
        // dereference the callback
        client._reqs[client._seqid] = null
        throw e // re-throw the error to Rx
      }
    }
  })
}

// Set a global mapdcon function when mapdcon is brought in via script tag.
if (typeof module === "object" && module.exports) {
  if (!isNodeRuntime()) {
    window.MapdCon = MapdCon
  }
}
module.exports = MapdCon
export default MapdCon
