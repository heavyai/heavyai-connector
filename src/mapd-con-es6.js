const {TDatumType, TEncodingType, TPixel} = (isNodeRuntime() && require("../build/thrift/node/mapd_types.js")) || window // eslint-disable-line global-require
const MapDThrift = isNodeRuntime() && require("../build/thrift/node/mapd.thrift.js") // eslint-disable-line global-require
let Thrift = (isNodeRuntime() && require("thrift")) || window.Thrift // eslint-disable-line global-require
const thriftWrapper = Thrift
const parseUrl = isNodeRuntime() && require("url").parse // eslint-disable-line global-require
if (isNodeRuntime()) { // Because browser Thrift and Node Thrift are exposed slightly differently.
  Thrift = Thrift.Thrift
  Thrift.Transport = thriftWrapper.TBufferedTransport
  Thrift.Protocol = thriftWrapper.TJSONProtocol
}
import * as helpers from "./helpers"
import MapDClientV2 from "./mapd-client-v2"
import processQueryResults from "./process-query-results"

// Set a global Connector function when Connector is brought in via script tag.
if (typeof module === "object" && module.exports) {
  if (!isNodeRuntime()) {
    window.Connector = Connector
  }
}
module.exports = Connector
export default Connector

const COMPRESSION_LEVEL_DEFAULT = 3
const DEFAULT_QUERY_TIME = 50

function Connector () {
  // initialize variables
  const _datumEnum = {}
  const _queryTimes = {}
  let _client = null
  let _dbName = null
  let _host = null
  let _logging = false
  let _nonce = 0
  let _password = null
  let _port = null
  let _protocol = null
  let _sessionId = null
  let _user = null

  // invoke initialization methods
  publicizeMethods(this, [
    connect,
    createFrontendView,
    createLink,
    createTable,
    dbName,
    deleteFrontendView,
    detectColumnTypes,
    disconnect,
    getFields,
    getFrontendView,
    getFrontendViews,
    getLinkView,
    getPixel,
    getServerStatus,
    getTables,
    host,
    importShapeTable,
    importTable,
    logging,
    password,
    port,
    protocol,
    query,
    renderVega,
    sessionId,
    user,
    validateQuery
  ])
  invertDatumTypes(_datumEnum)

  // return this to allow chaining off of instantiation
  return this

  // public methods
  /**
   * Create a connection to the server, generating a client and session id.
   * @param {Function} callback (error, session) => {…}
   * @returns {undefined}
   *
   * @example <caption>Connect to a MapD server:</caption>
   * var con = new Connector()
   *   .host('localhost')
   *   .port('8080')
   *   .dbName('myDatabase')
   *   .user('foo')
   *   .password('bar')
   *   .connect((error, con) => console.log(con.sessionId()));
   *
   *   // ["om9E9Ujgbhl6wIzWgLENncjWsaXRDYLy"]
   */
  function connect (callback) { // eslint-disable-line consistent-return
    if (_sessionId) {
      disconnect()
    }

    if ([_host, _port, _user, _password, _dbName].some(Array.isArray)) {
      console.warn("Connection parameters as arrays is deprecated; use single values.") // eslint-disable-line no-console
      _host = Array.isArray(_host) ? _host[0] : _host
      _port = Array.isArray(_port) ? _port[0] : _port
      _user = Array.isArray(_user) ? _user[0] : _user
      _password = Array.isArray(_password) ? _password[0] : _password
      _dbName = Array.isArray(_dbName) ? _dbName[0] : _dbName
    }

    if (!_user) {
      return callback("Please enter a username.")
    } else if (!_password) {
      return callback("Please enter a password.")
    } else if (!_dbName) {
      return callback("Please enter a database.")
    } else if (!_host) {
      return callback("Please enter a host name.")
    } else if (!_port) {
      return callback("Please enter a port.")
    }

    _client = null
    _sessionId = null
    _protocol = _protocol || window.location.protocol.replace(":", "")

    const transportUrl = `${_protocol}://${_host}:${_port}`
    let client = null

    if (isNodeRuntime()) {
      const {protocol: parsedProtocol, hostname: parsedHost, port: parsedPort} = parseUrl(transportUrl)
      const connection = thriftWrapper.createHttpConnection(
        parsedHost,
        parsedPort,
        {
          transport: thriftWrapper.TBufferedTransport,
          protocol: thriftWrapper.TJSONProtocol,
          path: "/",
          headers: {Connection: "close"},
          https: parsedProtocol === "https:"
        }
      )
      connection.on("error", console.error) // eslint-disable-line no-console
      client = thriftWrapper.createClient(MapDThrift, connection)
      resetThriftClientOnArgumentErrorForMethods(this, client, Object.keys(this))
    } else {
      const thriftTransport = new Thrift.Transport(transportUrl)
      const thriftProtocol = new Thrift.Protocol(thriftTransport)
      client = new MapDClientV2(thriftProtocol)
    }
    client.connect(_user, _password, _dbName, (error, newSessionId) => { // eslint-disable-line no-loop-func
      if (error) { return callback(normalizeError(error)) }
      _client = client
      _sessionId = newSessionId
      return callback(null, this)
    })
  }
  /**
   * Disconnect from the server then clears the client and session values.
   * @param {Function} callback (error) => {…}
   * @returns {undefined}
   *
   * @example <caption>Disconnect from the server:</caption>
   *
   * con.sessionId() // ["om9E9Ujgbhl6wIzWgLENncjWsaXRDYLy"]
   * con.disconnect((err) => {
   *   console.error(err);
   *   con.sessionId() === null;
   * })
   */
  function disconnect (callback = noop) {
    if (_sessionId !== null) {
      _client.disconnect(_sessionId, error => { // eslint-disable-line no-loop-func
        if (error) { return callback(error, this) }
        _sessionId = null
        _client = null
        return callback(null, this)
      })
    }
  }
  /**
   * Get a dashboard object containing a value for the <code>view_state</code> property.
   * This object contains a value for the <code>view_state</code> property,
   * but not for the <code>view_name</code> property.
   * @param {String} viewName the name of the dashboard
   * @param {Function} callback (error, data) => {…}
   * @returns {undefined}
   *
   * @example <caption>Get a specific dashboard from the server:</caption>
   *
   * con.getFrontendView('dashboard_name').then((result) => console.log(result))
   * // {TFrontendView}
   */
  function getFrontendView (viewName, callback) {
    if (_sessionId && viewName) {
      _client.get_frontend_view(_sessionId, viewName, callback)
      return
    } else {
      callback(new Error("No Session ID"))
      return
    }
  }
  /**
   * Get the recent dashboards as a list of <code>TFrontendView</code> objects.
   * These objects contain a value for the <code>view_name</code> property,
   * but not for the <code>view_state</code> property.
   * @param {Function} callback (error, data) => {…}
   * @returns {undefined}
   *
   * @example <caption>Get the list of dashboards from the server:</caption>
   *
   * con.getFrontendViews().then((results) => console.log(results))
   * // [TFrontendView, TFrontendView]
   */
  function getFrontendViews (callback) {
    if (_sessionId) {
      _client.get_frontend_views(_sessionId, callback)
    } else {
      callback(new Error("No Session ID"))
      return
    }
  }
  /**
   * Get the status of the server as a <code>TServerStatus</code> object.
   * This includes whether the server is read-only,
   * has backend rendering enabled, and the version number.
   * @param {Function} callback (error, data) => {…}
   * @returns {undefined}
   *
   * @example <caption>Get the server status:</caption>
   *
   * con.getServerStatus().then((result) => console.log(result))
   * // {
   * //   "read_only": false,
   * //   "version": "3.0.0dev-20170503-40e2de3",
   * //   "rendering_enabled": true,
   * //   "start_time": 1493840131
   * // }
   */
  function getServerStatus (callback) {
    _client.get_server_status(_sessionId, callback)
  }
  /**
   * Add a new dashboard to the server.
   * @param {String} viewName - the name of the new dashboard
   * @param {String} viewState - the base64-encoded state string of the new dashboard
   * @param {String} imageHash - the numeric hash of the dashboard thumbnail
   * @param {String} metaData - Stringified metaData related to the view
   * @param {Function} callback (error) => {…} success returns null
   * @returns {undefined}
   *
   * @example <caption>Add a new dashboard to the server:</caption>
   *
   * con.createFrontendView('newSave', 'viewstateBase64', null, 'metaData').then(res => console.log(res))
   */
  function createFrontendView (viewName, viewState, imageHash, metaData, callback) {
    if (!_sessionId) { return callback(new Error("You are not connected to a server. Try running the connect method first.")) }
    return _client.create_frontend_view(_sessionId, viewName, viewState, imageHash, metaData, callback)
  }
  /**
   * Delete a dashboard object containing a value for the <code>view_state</code> property.
   * @param {String} viewName - the name of the dashboard
   * @param {Function} callback (error, data) => {…}
   * @returns {undefined}
   *
   * @example <caption>Delete a specific dashboard from the server:</caption>
   *
   * con.deleteFrontendView('dashboard_name').then(res => console.log(res))
   */
  function deleteFrontendView (viewName, callback) {
    if (!_sessionId) {
      return callback(new Error("You are not connected to a server. Try running the connect method first."))
    }
    try { // eslint-disable-line no-restricted-syntax
      return _client.delete_frontend_view(_sessionId, viewName, callback)
    } catch (err) {
      return callback(new Error("Could not delete the frontend view; check your session id.", err))
    }
  }
  /**
   * Create a short hash to make it easy to share a link to a specific dashboard.
   * @param {String} viewState - the base64-encoded state string of the new dashboard
   * @param {String} metaData - Stringified metaData related to the link
   * @param {Function} callback (error, id) => {…}
   * @returns {undefined}
   *
   * @example <caption>Create a link to the current state of a dashboard:</caption>
   *
   * con.createLink("eyJuYW1lIjoibXlkYXNoYm9hcmQifQ==", 'metaData').then(res => console.log(res));
   * // ["28127951"]
   */
  function createLink (viewState, metaData, callback) {
    return _client.create_link(_sessionId, viewState, metaData, (error, data) => {
      if (error) { return callback(normalizeError(error)) }
      const result = data.split(",").reduce((links, link) => { // eslint-disable-line max-nested-callbacks
        if (!links.includes(link)) { links.push(link) }
        return links
      }, [])
      if (!result || result.length !== 1) {
        return callback(new Error("Different links were created on connection"))
      } else {
        return callback(null, result.join())
      }
    })
  }
  /**
   * Get a fully-formed dashboard object from a generated share link.
   * This object contains the given link for the <code>view_name</code> property,
   * @param {String} link - the short hash of the dashboard, see {@link createLink}
   * @param {Function} callback (error, data) => {…}
   * @returns {undefined}
   *
   * @example <caption>Get a dashboard from a link:</caption>
   *
   * con.getLinkView('28127951').then(res => console.log(res))
   * //  {
   * //    "view_name": "28127951",
   * //    "view_state": "eyJuYW1lIjoibXlkYXNoYm9hcmQifQ==",
   * //    "image_hash": "",
   * //    "update_time": "2017-04-28T21:34:01Z",
   * //    "view_metadata": "metaData"
   * //  }
   */
  function getLinkView (link, callback) {
    _client.get_link_view(_sessionId, link, (error, data) => {
      if (error) {
        return callback(normalizeError(error))
      } else {
        return callback(null, data)
      }
    })
  }
  /**
   * Asynchronously get the data from an importable file,
   * such as a .csv or plaintext file with a header.
   * @param {String} fileName - the name of the importable file
   * @param {TCopyParams} copyParams - see {@link TCopyParams}
   * @param {Function} callback (error, data) => {…}
   * @returns {undefined}
   *
   * @example <caption>Get data from table_data.csv:</caption>
   *
   * var copyParams = new TCopyParams();
   * con.detectColumnTypes('table_data.csv', copyParams).then(res => console.log(res))
   * // TDetectResult {row_set: TRowSet, copy_params: TCopyParams}
   *
   */
  function detectColumnTypes (fileName, copyParams, callback) {
    const thriftCopyParams = helpers.convertObjectToThriftCopyParams(copyParams)
    _client.detect_column_types(_sessionId, fileName, thriftCopyParams, callback)
  }
  /**
   * Submit a query to the database and process the results.
   * @param {String} sql The query to perform
   * @param {Object} options the options for the query
   * @param {Function} callback (error, data) => {…}
   * @returns {undefined}
   *
   * @example <caption>create a query</caption>
   *
   * var query = "SELECT count(*) AS n FROM tweets_nov_feb WHERE country='CO'";
   * var options = {};
   *
   * con.query(query, options, function(error, data) {
   *        console.log(data)
   *      });
   *
   */
  function query (sql, options, callback) {
    let columnarResults = true
    let eliminateNullRows = false
    let queryId = null
    let returnTiming = false
    let limit = -1
    if (options) {
      columnarResults = options.hasOwnProperty("columnarResults") ? options.columnarResults : columnarResults
      eliminateNullRows = options.hasOwnProperty("eliminateNullRows") ? options.eliminateNullRows : eliminateNullRows
      queryId = options.hasOwnProperty("queryId") ? options.queryId : queryId
      returnTiming = options.hasOwnProperty("returnTiming") ? options.returnTiming : returnTiming
      limit = options.hasOwnProperty("limit") ? options.limit : limit
    }

    const lastQueryTime = queryId in _queryTimes ? _queryTimes[queryId] : DEFAULT_QUERY_TIME

    const curNonce = (_nonce++).toString()

    const processResultsOptions = {
      returnTiming,
      eliminateNullRows,
      sql,
      queryId,
      conId: 0,
      estimatedQueryTime: lastQueryTime
    }

    _client.sql_execute(_sessionId, sql, columnarResults, curNonce, limit, (error, result) => {
      if (error) {
        return callback(normalizeError(error))
      } else {
        return processResults(result, callback, _logging, _datumEnum, processResultsOptions)
      }
    })
  }
  /**
   * Submit a query to validate whether the backend can create a result set based on the SQL statement.
   * @param {String} sql The query to perform
   * @param {Function} callback (error, data) => {…}
   * @returns {undefined}
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
  function validateQuery (sql, callback) {
    _client.sql_validate(_sessionId, sql, (error, data) => {
      if (error) {
        return callback(normalizeError(error))
      } else {
        return callback(null, convertFromThriftTypes(data, _datumEnum))
      }
    })
  }
  /**
   * Get the names of the databases that exist on the current session's connectdion.
   * @param {Function} callback (error, data) => {…}
   * @returns {undefined}
   *
   * @example <caption>Get the list of tables from a connection:</caption>
   *
   *  con.getTables().then(res => console.log(res))
   *
   *  //  [{
   *  //    label: 'obs', // deprecated property
   *  //    name: 'myDatabaseName'
   *  //   },
   *  //  ...]
   */
  function getTables (callback) {
    _client.get_tables(_sessionId, (error, tables) => {
      if (error) {
        return callback(normalizeError(error))
      } else {
        return callback(null, tables.map((table) => ({name: table, label: "obs"})))
      }
    })
  }
  /**
   * Get a list of field objects for a given table.
   * @param {String} tableName - name of table containing field names
   * @param {Function} callback - (error, fields) => {…}
   * @returns {undefined}
   *
   * @example <caption>Get the list of fields from a specific table:</caption>
   *
   * con.getFields('flights', (error, res) => console.log(res))
   * // [{
   *   name: 'fieldName',
   *   type: 'BIGINT',
   *   is_array: false,
   *   is_dict: false
   * }, ...]
   */
  function getFields (tableName, callback) {
    _client.get_table_details(_sessionId, tableName, (error, fields) => {
      if (fields) {
        const rowDict = fields.row_desc.reduce((accum, value) => {
          accum[value.col_name] = value
          return accum
        }, {})
        return callback(null, convertFromThriftTypes(rowDict, _datumEnum))
      } else {
        return callback(normalizeError(error))
      }
    })
  }
  /**
   * Create a table and persist it to the backend.
   * @param {String} tableName - desired name of the new table
   * @param {Array<TColumnType>} rowDescObj - fields of the new table
   * @param {Number<TTableType>} tableType - the types of tables a user can import into the db
   * @param {Function} callback (error, data) => {…}
   * @returns {undefined}
   *
   * @example <caption>Create a new table:</caption>
   *
   *  con.createTable('mynewtable', [TColumnType, TColumnType, ...], 0).then(res => console.log(res));
   *  // undefined
   */
  function createTable (tableName, rowDescObj, tableType, callback) {
    if (!_sessionId) {
      return callback(new Error("You are not connected to a server. Try running the connect method first."))
    }
    const thriftRowDesc = helpers.mutateThriftRowDesc(rowDescObj, null)
    return _client.create_table(
      _sessionId,
      tableName,
      thriftRowDesc,
      tableType,
      callback
    )
  }
  /**
   * Import a delimited table from a file.
   * @param {String} tableName - desired name of the new table
   * @param {String} fileName - name of imported file
   * @param {TCopyParams} copyParams - see {@link TCopyParams}
   * @param {TColumnType[]} rowDescObj -- a colleciton of metadata related to the table headers
   * @param {Function} callback (error, data) => {…}
   * @param {Boolean} isShapeFile false by default, enabled to import shape data.
   * @returns {undefined}
   */
  function importTable (tableName, fileName, copyParams, rowDescObj, callback, isShapeFile = false) {
    if (!_sessionId) {
      return callback(new Error("You are not connected to a server. Try running the connect method first."))
    }

    const thriftCopyParams = helpers.convertObjectToThriftCopyParams(copyParams)
    const thriftRowDesc = helpers.mutateThriftRowDesc(rowDescObj, null)

    if (isShapeFile) {
      return _client.import_geo_table(
        _sessionId,
        tableName,
        fileName,
        thriftCopyParams,
        thriftRowDesc,
        callback
      )
    } else {
      return _client.import_table(
        _sessionId,
        tableName,
        fileName,
        thriftCopyParams,
        callback
      )
    }
  }
  /**
   * Import a geo table from a file.
   * @param {String} tableName - desired name of the new table
   * @param {String} fileName - name of imported file
   * @param {TCopyParams} copyParams - see {@link TCopyParams}
   * @param {TColumnType[]} rowDescObj -- a colleciton of metadata related to the table headers
   * @param {Function} callback (error, data) => {…}
   * @returns {undefined}
   */
  function importShapeTable (tableName, fileName, copyParams, rowDescObj, callback) {
    return importTable(tableName, fileName, copyParams, rowDescObj, callback, true)
  }
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
   * @param {Function} callback (error, Base64Image) => {…}
   * @returns {undefined}
   */
  function renderVega (widgetid, vega, options, callback) {
    let queryId = null
    let compressionLevel = COMPRESSION_LEVEL_DEFAULT
    if (options) {
      queryId = options.hasOwnProperty("queryId") ? options.queryId : queryId
      compressionLevel = options.hasOwnProperty("compressionLevel") ? options.compressionLevel : compressionLevel
    }

    const lastQueryTime = queryId in _queryTimes ? _queryTimes[queryId] : DEFAULT_QUERY_TIME

    const curNonce = (_nonce++).toString()

    const processResultsOptions = {
      isImage: true,
      query: "render: " + vega,
      queryId,
      conId: 0,
      estimatedQueryTime: lastQueryTime
    }

    _client.render_vega(_sessionId, widgetid, vega, compressionLevel, curNonce, (error, result) => {
      if (error) { return callback(normalizeError(error)) }
      return processResults(result, callback, _logging, _datumEnum, processResultsOptions)
    })
  }
  /**
   * Used primarily for backend rendered maps, this method will fetch the row
   * for a specific table that was last rendered at a pixel.
   * @param {Number} widgetId - the widget id of the caller
   * @param {TPixel} pixel - the pixel (lower left-hand corner is pixel (0,0))
   * @param {Object} tableColNamesMap - object of tableName -> array of col names
   * @param {Function} callback (error, results) => {…}
   * @param {Number} [pixelRadius=2] - the radius around the primary pixel to search
   * @returns {undefined}
   */
  function getPixel (widgetId, pixel, tableColNamesMap, callback, pixelRadius = 2) {
    if (Array.isArray(callback)) {
      console.warn("getPixel callbacks array deprecated; pass single callback instead.") // eslint-disable-line no-console
      callback = callback[0]
    }
    if (!(pixel instanceof TPixel)) { pixel = new TPixel(pixel) }
    const columnFormat = true
    const curNonce = String(_nonce++)
    _client.get_result_row_for_pixel(
      _sessionId,
      widgetId,
      pixel,
      tableColNamesMap,
      columnFormat,
      pixelRadius,
      curNonce,
      processPixelResults.bind(this, callback, _logging, _datumEnum)
    )
  }
  /**
   * Get or set the session ID used by the server to serve the correct data.
   * This is typically set by {@link connect} and should not be set manually.
   * @param {Number} newSessionId - The session ID of the current connection
   * @returns {Number|Connector} - The session ID or the Connector itself
   *
   * @example <caption>Get the session id:</caption>
   *
   *  con.sessionId();
   * // sessionID === 3145846410
   *
   * @example <caption>Set the session id:</caption>
   * var con = new Connector().connect().sessionId(3415846410);
   * // NOTE: It is generally unsafe to set the session id manually.
   */
  function sessionId (newSessionId) {
    if (!arguments.length) {
      return _sessionId
    }
    _sessionId = newSessionId
    return this
  }
  /**
   * Get or set the connection server hostname.
   * This is is typically the first method called after instantiating a new Connector.
   * @param {String} hostname - The hostname address
   * @returns {String|Connector} - The hostname or the Connector itself
   *
   * @example <caption>Set the hostname:</caption>
   * var con = new Connector().host('localhost');
   *
   * @example <caption>Get the hostname:</caption>
   * var host = con.host();
   * // host === 'localhost'
   */
  function host (hostname) {
    if (!arguments.length) {
      return _host
    }
    _host = hostname
    return this
  }
  /**
   * Get or set the connection port.
   * @param {String} thePort - The port to connect on
   * @returns {String|Connector} - The port or the Connector itself
   *
   * @example <caption>Set the port:</caption>
   * var con = new Connector().port('8080');
   *
   * @example <caption>Get the port:</caption>
   * var port = con.port();
   * // port === '8080'
   */
  function port (thePort) {
    if (!arguments.length) {
      return _port
    }
    _port = thePort
    return this
  }
  /**
   * Get or set the username to authenticate with.
   * @param {String} username - The username to authenticate with
   * @returns {String|Connector} - The username or the Connector itself
   *
   * @example <caption>Set the username:</caption>
   * var con = new Connector().user('foo');
   *
   * @example <caption>Get the username:</caption>
   * var username = con.user();
   * // user === 'foo'
   */
  function user (username) {
    if (!arguments.length) {
      return _user
    }
    _user = username
    return this
  }
  /**
   * Get or set the user's password to authenticate with.
   * @param {String} pass - The password to authenticate with
   * @returns {String|Connector} - The password or the Connector itself
   *
   * @example <caption>Set the password:</caption>
   * var con = new Connector().password('bar');
   *
   * @example <caption>Get the username:</caption>
   * var password = con.password();
   * // password === 'bar'
   */
  function password (pass) {
    if (!arguments.length) {
      return _password
    }
    _password = pass
    return this
  }
  /**
   * Get or set the name of the database to connect to.
   * @param {String} db - The database to connect to
   * @returns {String|Connector} - The name of the database or the Connector itself
   *
   * @example <caption>Set the database name:</caption>
   * var con = new Connector().dbName('myDatabase');
   *
   * @example <caption>Get the database name:</caption>
   * var dbName = con.dbName();
   * // dbName === 'myDatabase'
   */
  function dbName (db) {
    if (!arguments.length) {
      return _dbName
    }
    _dbName = db
    return this
  }
  /**
   * Whether the raw queries strings will be logged to the console.
   * Used primarily for debugging and defaults to <code>false</code>.
   * @param {Boolean} loggingEnabled - Set to true to enable logging
   * @returns {Boolean|Connector} - The current logging flag or Connector itself
   *
   * @example <caption>Set logging to true:</caption>
   * var con = new Connector().logging(true);
   *
   * @example <caption>Get the logging flag:</caption>
   * var isLogging = con.logging();
   * // isLogging === true
   */
  function logging (loggingEnabled) {
    if (typeof loggingEnabled === "undefined") {
      return _logging
    } else if (typeof loggingEnabled !== "boolean") {
      return "logging can only be set with boolean values"
    }
    _logging = loggingEnabled
    const isEnabledTxt = loggingEnabled ? "enabled" : "disabled"
    return `SQL logging is now ${isEnabledTxt}`
  }
  /**
   * The protocol to use for requests.
   * @param {String} theProtocol - http or https
   * @returns {String|Connector} - protocol or Connector itself
   *
   * @example <caption>Set the protocol:</caption>
   * var con = new Connector().protocol('http');
   *
   * @example <caption>Get the protocol:</caption>
   * var protocol = con.protocol();
   * // protocol === 'http'
   */
  function protocol (theProtocol) {
    if (!arguments.length) {
      return _protocol
    }
    _protocol = theProtocol
    return this
  }
}

// helper functions

function noop () { /* noop */ }

function isNodeRuntime () { return typeof window === "undefined" }

function publicizeMethods (theClass, methods) { methods.forEach(method => { theClass[method.name] = method }) }

function convertFromThriftTypes (fields, _datumEnum) {
  const fieldsArray = []
  for (const key in fields) {
    if (fields.hasOwnProperty(key)) {
      fieldsArray.push({
        name: key,
        type: _datumEnum[fields[key].col_type.type],
        is_array: fields[key].col_type.is_array,
        is_dict: fields[key].col_type.encoding === TEncodingType.DICT
      })
    }
  }
  return fieldsArray
}

function updateQueryTimes (queryTimes) {
  return (conId, queryId, estimatedQueryTime, execution_time_ms) => {
    queryTimes[queryId] = execution_time_ms
  }
}

function processPixelResults (callback, _logging, _datumEnum, error, results) { // eslint-disable-line consistent-return
  if (error) { return callback(normalizeError(error)) }
  results = Array.isArray(results) ? results.pixel_rows : [results]
  const numPixels = results.length
  const processResultsOptions = {
    isImage: false,
    eliminateNullRows: false,
    query: "pixel request",
    queryId: -2
  }
  let numResultsProcessed = 0
  for (let p = 0; p < numPixels; p++) {
    processResults(results[p], aggregatingCallback(p), _logging, _datumEnum, processResultsOptions)
  }
  function aggregatingCallback (index) {
    return (processResultsError, row_set) => {
      results[index].row_set = row_set
      if (processResultsError) {
        numResultsProcessed = -Infinity // avoid invoking callback again
        return callback(processResultsError)
      } else if (numResultsProcessed === numPixels - 1) {
        return callback(null, results)
      } else {
        return numResultsProcessed++
      }
    }
  }
}

function processResults (result, callback, _logging, _datumEnum, options = {}) {
  const processor = processQueryResults(_logging, updateQueryTimes)
  const processResultsObject = processor(options, _datumEnum, result, callback)
  return processResultsObject
}

function invertDatumTypes (datumEnum) {
  const datumType = TDatumType
  for (const key in datumType) {
    if (datumType.hasOwnProperty(key)) {
      datumEnum[datumType[key]] = key
    }
  }
}

function resetThriftClientOnArgumentErrorForMethods (connector, client, methodNames) {
  methodNames.forEach(methodName => {
    const oldFunc = connector[methodName]
    connector[methodName] = (...args) => {
      try { // eslint-disable-line no-restricted-syntax
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

function normalizeError (error) {
  if (isNodeRuntime()) {
    return new Error(`${error.name} ${error.error_msg}`)
  } else {
    return new Error(`TMapDException ${error.message}`)
  }
}
