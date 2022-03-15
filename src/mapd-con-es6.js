import EventEmitter from "eventemitter3"
import { Table } from "apache-arrow"
import util from "util"
import {
  TDatumType,
  TEncodingType,
  TDeviceType
} from "../thrift/common_types.js"
import {
  TArrowTransport,
  TCreateParams,
  TDashboardPermissions,
  TDatabasePermissions,
  TDBObjectPermissions,
  TDBObjectType,
  TPixel,
  TDBException,
  TImportHeaderRow,
  TFileType,
  TRasterPointType,
  TSourceType,
  TRasterPointTransform
} from "../thrift/omnisci_types.js"
import MapDThrift from "../thrift/OmniSci.js"
import {
  TBinaryProtocol,
  TBufferedTransport,
  TJSONProtocol,
  XHRConnection,
  createClient,
  createHttpConnection,
  createXHRClient
} from "thrift"
import processQueryResults from "./process-query-results"
import * as helpers from "./helpers"

const COMPRESSION_LEVEL_DEFAULT = 3

function arrayify(maybeArray) {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray]
}

// custom version of XHRConnection which can set `withCredentials` for CORS
function CustomXHRConnection(host, port, opts) {
  XHRConnection.call(this, host, port, opts)
  if (opts.headers["Content-Type"] === "application/vnd.apache.thrift.binary") {
    // this is copy/paste from thrift with the noted changes below
    this.flush = () => {
      if (this.url === undefined || this.url === "") {
        return this.send_buf
      }

      const xreq = this.getXmlHttpRequestObject()

      // removed overrideMimeType since we're expecting binary data
      // added responseType
      xreq.responseType = "arraybuffer"
      xreq.onreadystatechange = () => {
        if (xreq.readyState === 4 && xreq.status === 200) {
          // changed responseText -> response
          this.setRecvBuffer(xreq.response)
        }
      }

      xreq.open("POST", this.url, true)

      Object.keys(this.headers).forEach((headerKey) => {
        xreq.setRequestHeader(headerKey, this.headers[headerKey])
      })

      xreq.send(this.send_buf)
    }
  }
}

util.inherits(CustomXHRConnection, XHRConnection)

CustomXHRConnection.prototype.getXmlHttpRequestObject = function () {
  const obj = XHRConnection.prototype.getXmlHttpRequestObject.call(this)
  obj.withCredentials = CustomXHRConnection.withCredentials
  return obj
}

// Custom version of TJSONProtocol - thrift 0.14.0 throws an exception if
// anything other than a string or Buffer is passed to writeString. For
// example: we use a number for a nonce that is defined as a string type. So,
// let's just coerce things to a string.
function CustomTJSONProtocol(...args) {
  TJSONProtocol.apply(this, args)
}

util.inherits(CustomTJSONProtocol, TJSONProtocol)

CustomTJSONProtocol.prototype.writeString = function (arg) {
  if (!(arg instanceof Buffer)) {
    arg = String(arg)
  }
  return TJSONProtocol.prototype.writeString.call(this, arg)
}

// Additionally, the browser version of connector relied on thrift's old
// behavior of returning a Number for a 64-bit int. Technically, javascript
// does not have 64-bits of precision in a Number, so this can end up giving
// incorrect results.
//
// Lastly, the browser version relied on thrift returning a string from a
// binary type.
if (process.env.BROWSER) {
  CustomTJSONProtocol.prototype.readI64 = function () {
    const n = TJSONProtocol.prototype.readI64.call(this)
    return n.toNumber(true)
  }

  CustomTJSONProtocol.prototype.readBinary = function () {
    return TJSONProtocol.prototype.readString.call(this)
  }
}

// Custom version of the binary protocol to override writeString, readI64, and
// readBinary as above.
function CustomBinaryProtocol(...args) {
  TBinaryProtocol.apply(this, args)
}

util.inherits(CustomBinaryProtocol, TBinaryProtocol)

CustomBinaryProtocol.prototype.writeString = function (arg) {
  if (!(arg instanceof Buffer)) {
    arg = String(arg)
  }
  return TBinaryProtocol.prototype.writeString.call(this, arg)
}

if (process.env.BROWSER) {
  CustomBinaryProtocol.prototype.readI64 = function () {
    const n = TBinaryProtocol.prototype.readI64.call(this)
    return n.toNumber(true)
  }

  CustomBinaryProtocol.prototype.readBinary = function () {
    return TBinaryProtocol.prototype.readBinary.call(this).toString("base64")
  }
}

function buildClient(url, useBinaryProtocol) {
  const urlObj = new URL(url)
  const protocol = urlObj.protocol
  const hostname = urlObj.hostname
  let port = urlObj.port
  if (port === "") {
    port = protocol === "https:" ? "443" : "80"
  }

  let client = null
  if (!process.env.BROWSER) {
    const connection = createHttpConnection(hostname, port, {
      transport: TBufferedTransport,
      protocol: useBinaryProtocol ? CustomBinaryProtocol : CustomTJSONProtocol,
      path: "/",
      headers: {
        Connection: "close",
        "Content-Type": `application/vnd.apache.thrift.${
          useBinaryProtocol ? "binary" : "json"
        }`
      },
      https: protocol === "https:"
    })
    connection.on("error", console.error) // eslint-disable-line no-console
    client = createClient(MapDThrift, connection)
  } else {
    const connection = new CustomXHRConnection(hostname, port, {
      transport: TBufferedTransport,
      protocol: useBinaryProtocol ? CustomBinaryProtocol : CustomTJSONProtocol,
      path: "/",
      headers: {
        "Content-Type": `application/vnd.apache.thrift.${
          useBinaryProtocol ? "binary" : "json"
        }`
      },
      https: protocol === "https:"
    })
    connection.on("error", console.error) // eslint-disable-line no-console
    client = createXHRClient(MapDThrift, connection)
  }
  return client
}

export class MapdCon {
  constructor() {
    this._useBinaryProtocol = false
    this._host = null
    this._user = null
    this._password = null
    this._port = null
    this._dbName = null
    this._client = null
    this._sessionId = null
    this._protocol = null
    this._disableAutoReconnect = false
    this._datumEnum = {}
    this.TFileTypeMap = {}
    this.TEncodingTypeMap = {}
    this.TImportHeaderRowMap = {}
    this.TRasterPointTypeMap = {}
    this.TRasterPointTransformMap = {}
    this.TSourceTypeMap = {}
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
    this.buildTFileTypeMap()
    this.buildTEncodingTypeMap()
    this.buildTImportHeaderRowMap()
    this.buildTRasterPointTypeMap()
    this.buildTRasterPointTransformMap()
    this.buildTSourceTypeMap()

    this.processResults = (options = {}, promise) =>
      promise
        .catch((error) => {
          if (this._logging && options.query) {
            // eslint-disable-next-line no-console
            console.error(options.query, "\n", error)
          }
          throw error
        })
        .then((result) => {
          const processor = processQueryResults(
            this._logging,
            this.updateQueryTimes
          )
          const processResultsObject = processor(
            options,
            this._datumEnum,
            result
          )
          return processResultsObject
        })

    // return this to allow chaining off of instantiation
    return this
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

  updateQueryTimes = (
    conId,
    queryId,
    estimatedQueryTime,
    execution_time_ms
  ) => {
    this.queryTimes[queryId] = execution_time_ms
  }

  events = new EventEmitter()
  EVENT_NAMES = {
    ERROR: "error",
    METHOD_CALLED: "method-called"
  }

  // ** Method wrappers **

  handleErrors = (method) => (...args) =>
    method.apply(this, args).catch((error) => {
      this.events.emit(this.EVENT_NAMES.ERROR, error)
      throw error
    })

  // for backward compatibility
  callbackify = (method, arity) => (...args) => {
    let callback = null
    if (args.length === arity + 1) {
      callback = args.pop()
    }

    const promise = this[method].apply(this, args)
    if (callback) {
      promise.catch((err) => callback(err)).then((res) => callback(null, res))
    }
    return promise
  }

  overSingleClient = "SINGLE_CLIENT"
  overAllClients = "ALL_CLIENTS"

  // Wrap a Thrift method to perform session check and mapping over
  // all clients (for mutating methods)
  wrapThrift = (methodName, overClients, processArgs) => (...args) => {
    if (this._sessionId) {
      const processedArgs = processArgs(args)
      if (process.env.BROWSER) {
        this.events.emit(this.EVENT_NAMES.METHOD_CALLED, methodName)
      }

      if (overClients === this.overSingleClient) {
        return this._client[0][methodName].apply(
          this._client[0],
          [this._sessionId[0]].concat(processedArgs)
        )
      } else {
        return Promise.all(
          this._client.map((client, index) =>
            client[methodName].apply(
              client,
              [this._sessionId[index]].concat(processedArgs)
            )
          )
        )
      }
    } else {
      return Promise.reject(
        new Error(
          "You are not connected to a server. Try running the connect method first."
        )
      )
    }
  }

  xhrWithCredentials(enabled) {
    CustomXHRConnection.withCredentials = Boolean(enabled)
  }

  /**
   * Initializes the connector for use. This is similar to `connect()`, but stops short of
   * actually connecting to the server.
   *
   * @return {MapdCon} Object.
   */
  initClients() {
    const allAreArrays =
      Array.isArray(this._host) &&
      Array.isArray(this._port) &&
      Array.isArray(this._dbName)
    if (!allAreArrays) {
      throw new Error("Host, port, and dbName must be arrays.")
    }

    this._client = []
    this._sessionId = []

    if (!this._host[0]) {
      throw new Error("Please enter a host name.")
    } else if (!this._port[0]) {
      throw new Error("Please enter a port.")
    }

    // now check to see if length of all arrays are the same and > 0
    const hostLength = this._host.length
    if (hostLength < 1) {
      throw new Error("Must have at least one server to connect to.")
    }
    if (hostLength !== this._port.length) {
      throw new Error("Array connection parameters must be of equal length.")
    }

    if (!this._protocol) {
      this._protocol = this._host.map(() =>
        window.location.protocol.replace(":", "")
      )
    }

    const transportUrls = this.getEndpoints()
    const clients = []

    for (let h = 0; h < hostLength; h++) {
      const client = buildClient(transportUrls[h], this._useBinaryProtocol)
      clients.push(client)
    }
    this._client = clients
    this._numConnections = this._client.length
    return this
  }

  /**
   * Create a connection to the MapD server, generating a client and session ID.
   * @return {Promise.MapdCon} Object.
   *
   * @example <caption>Connect to a MapD server:</caption>
   * var con = new MapdCon()
   *   .host('localhost')
   *   .port('8080')
   *   .dbName('myDatabase')
   *   .user('foo')
   *   .password('bar')
   *   .connect()
   *   .then((con) => console.log(con.sessionId()));
   *
   *   // ["om9E9Ujgbhl6wIzWgLENncjWsaXRDYLy"]
   */
  connectAsync() {
    if (!Array.isArray(this._user) || !Array.isArray(this._password)) {
      return Promise.reject("Username and password must be arrays.")
    }

    if (!this._dbName[0]) {
      return Promise.reject("Please enter a database.")
    } else if (!this._user[0]) {
      return Promise.reject("Please enter a username.")
    } else if (!this._password[0]) {
      return Promise.reject("Please enter a password.")
    }

    // now check to see if length of all arrays are the same and > 0
    const hostLength = this._host.length
    if (hostLength < 1) {
      return Promise.reject("Must have at least one server to connect to.")
    }
    if (
      hostLength !== this._port.length ||
      hostLength !== this._user.length ||
      hostLength !== this._password.length ||
      hostLength !== this._dbName.length
    ) {
      return Promise.reject(
        "Array connection parameters must be of equal length."
      )
    }

    let clients = []
    this.initClients()
    clients = this._client

    // Reset the client property, so we can add only the ones that we can connect to below
    this._client = []
    return Promise.all(
      clients.map((client, h) =>
        client
          .connect(this._user[h], this._password[h], this._dbName[h])
          .then((sessionId) => {
            this._client.push(client)
            this._sessionId.push(sessionId)
            return null
          })
      )
    ).then(() => this)
  }

  /**
   * Create a connection to the MapD server, generating a client and session ID.
   * @param {Function} callback An optional callback that takes `(err, success)` as its signature.  Returns con singleton if successful.
   * @return {Promise.MapdCon} Object.
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
  connect = this.callbackify("connectAsync", 0)

  convertFromThriftTypes(fields) {
    const fieldsArray = []
    // silly to change this from map to array
    // - then later it turns back to map
    for (const key in fields) {
      if (fields.hasOwnProperty(key)) {
        fieldsArray.push({
          name: key,
          type: this._datumEnum[fields[key].col_type.type],
          precision: fields[key].col_type.precision,
          is_array: fields[key].col_type.is_array,
          is_dict: fields[key].col_type.encoding === TEncodingType.DICT // eslint-disable-line no-undef
        })
      }
    }
    return fieldsArray
  }

  /**
   * Disconnect from the server and then clear the client and session values.
   * @return {Promise.MapdCon} Object.
   *
   * @example <caption>Disconnect from the server:</caption>
   *
   * con.disconnect()
   */
  disconnectAsync = this.handleErrors(() => {
    return Promise.all(
      this._client.map((client, c) =>
        client.disconnect(this._sessionId[c]).catch((error) => {
          // ignore timeout errors
          if (error && !this.isTimeoutError(error)) {
            throw error
          }
        })
      )
    ).then(() => {
      this._sessionId = null
      this._client = null
      this._numConnections = 0
      this.serverPingTimes = null
      return this
    })
  })

  /**
   * Disconnect from the server and then clear the client and session values.
   * @param {Function} callback An optional callback that takes `(err, success)` as its signature.  Returns con singleton if successful.
   * @return {Promise.MapdCon} Object.
   *
   * @example <caption>Disconnect from the server:</caption>
   *
   * con.sessionId() // ["om9E9Ujgbhl6wIzWgLENncjWsaXRDYLy"]
   * con.disconnect((err, con) => console.log(err, con))
   * con.sessionId() === null;
   */
  disconnect = this.callbackify("disconnectAsync", 0)

  // ** Client methods **

  /**
   * Get the status of the server as a {@link TServerStatus} object.
   * This includes the server version number, whether the server is read-only,
   * and whether backend rendering is enabled.
   * @return {Promise.<Object>} An object that contains information about the server status.
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
  getStatusAsync = this.handleErrors(
    this.wrapThrift("get_status", this.overSingleClient, (args) => args)
  )

  /**
   * Get the status of the server as a {@link TServerStatus} object.
   * This includes the server version number, whether the server is read-only,
   * and whether backend rendering is enabled.
   * @param {Function} callback An optional callback that takes `(err, success)` as its signature.  Returns an object that contains information about the server status.
   * @return {Promise.<Object>} An object that contains information about the server status.
   *
   * @example <caption>Get the server status:</caption>
   *
   * con.getStatus((err, result) => console.log(result))
   * // [{
   * //   "read_only": false,
   * //   "version": "3.0.0dev-20170503-40e2de3",
   * //   "rendering_enabled": true,
   * //   "start_time": 1493840131
   * // }]
   */
  getStatus = this.callbackify("getStatusAsync", 0)

  /**
   * Get information about the server hardware:
   * - Number of GPUs.
   * - Number of GPUs allocated to MapD.
   * - Start GPU.
   * - Number of SMs, SMXs, or CUs (streaming multiprocessors).
   * - Clock frequency of each GPU.
   * - Physical memory of each GPU.
   * - Compute capability of each GPU.
   * @return {Promise.<Object>} An object that contains hardware information.
   *
   * @example <caption>Get server hardware information:</caption>
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
  getHardwareInfoAsync = this.handleErrors(
    this.wrapThrift("get_hardware_info", this.overSingleClient, (args) => args)
  )

  /**
   * Get information about the server hardware:
   * - Number of GPUs.
   * - Number of GPUs allocated to MapD.
   * - Start GPU.
   * - Number of SMs, SMXs, or CUs (streaming multiprocessors).
   * - Clock frequency of each GPU.
   * - Physical memory of each GPU.
   * - Compute capability of each GPU.
   * @param {Function} callback An optional callback that takes `(err, success)` as its signature.  Returns an object that contains hardware information.
   * @return {Promise.<Object>} An object that contains hardware information.
   *
   * @example <caption>Get server hardware information:</caption>
   *
   * con.getHardwareInfo((err, result) => console.log(result))
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
  getHardwareInfo = this.callbackify("getHardwareInfoAsync", 0)

  /**
   * Get the first geo file in an archive, if present, to determine if the archive should be treated as geo.
   * @param {String} archivePath - The base filename of the archive.
   * @param {TCopyParams} copyParams See {@link TCopyParams}
   * @returns {Promise.<String>} Full path to the located geo file; otherwise, to the original archivePath.
   *
   * @example <caption>Get the first geo file in an archive:</caption>
   *
   * con.getFirstGeoFileInArchiveAsync('archive.zip', {}).then(res => console.log(res))
   */
  getFirstGeoFileInArchiveAsync = this.handleErrors(
    this.wrapThrift(
      "get_first_geo_file_in_archive",
      this.overSingleClient,
      (args) => args
    )
  )

  /**
   * Gets a list of filenames found within an archive.
   * @param {String} archivePath - The base filename of the archive.
   * @param {TCopyParams} copyParams See {@link TCopyParams}
   * @returns {Promise.<Array>} A list of filenames (strings)
   *
   * @example <caption>Get the filenames found within an archive:</caption>
   *
   * con.getFilesInArchiveAsync('archive.zip', {}).then(res => console.log(res))
   */
  getFilesInArchiveAsync = this.handleErrors(
    this.wrapThrift(
      "get_all_files_in_archive",
      this.overSingleClient,
      (args) => args
    )
  )

  /**
   * Get a list of all users on the database for this connection.
   * @returns {Promise.<Array>} A list of all users (strings).
   *
   * @example <caption>Get a list of all users:</caption>
   *
   * con.getUsersAsync().then(res => console.log(res))
   */
  getUsersAsync = this.handleErrors(
    this.wrapThrift("get_users", this.overSingleClient, (args) => args)
  )

  importTableStatusAsync = this.handleErrors(
    this.wrapThrift(
      "import_table_status",
      this.overSingleClient,
      (args) => args
    )
  )

  /**
   * Get a list of all roles on the database for this connection.
   * @returns {Promise.<Array>} A list of all roles (strings).
   *
   * @example <caption>Get a list of all roles:</caption>
   *
   * con.getRolesAsync().then(res => console.log(res))
   */
  getRolesAsync = this.handleErrors(
    this.wrapThrift("get_roles", this.overSingleClient, (args) => args)
  )

  /**
   * Get a list of all dashboards on the database for this connection.
   * @returns {Promise.<Array<TDashboard>>} A list of all dashboards (Dashboard objects).
   *
   * @example <caption>Get a list of all dashboards:</caption>
   *
   * con.getDashboardsAsync().then(res => console.log(res))
   */
  getDashboardsAsync = this.handleErrors(
    this.wrapThrift("get_dashboards", this.overSingleClient, (args) => args)
  )

  /**
   * Get a single dashboard.
   * @param {Number} dashboardId - The ID of the dashboard.
   * @returns {Promise.<TDashboard>} The dashboard (Dashboard object).
   *
   * @example <caption>Get a dashboard:</caption>
   *
   * con.getDashboardAsync().then(res => console.log(res))
   */
  getDashboardAsync = this.handleErrors(
    this.wrapThrift("get_dashboard", this.overSingleClient, (args) => args)
  )

  /**
   * Add a new dashboard to the server.
   * @param {String} dashboardName - The name of the new dashboard.
   * @param {String} dashboardState - The Base64-encoded state string of the new dashboard.
   * @param {String} imageHash - The numeric hash of the dashboard thumbnail.
   * @param {String} metaData - Stringified metadata related to the view.
   * @return {Promise} Returns a Promise.all result (array) of the IDs created on each client.
   *
   * @example <caption>Add a new dashboard to the server:</caption>
   *
   * con.createDashboardAsync('newSave', 'dashboardstateBase64', null, 'metaData').then(res => console.log(res))
   */
  createDashboardAsync = this.handleErrors(
    this.wrapThrift("create_dashboard", this.overAllClients, (args) => args)
  )

  /**
   * Replace a dashboard on the server with new properties.
   * @param {Number} dashboardId - The ID of the dashboard to replace.
   * @param {String} dashboardName - The name of the new dashboard.
   * @param {String} dashboardOwner - User ID of the owner of the dashboard.
   * @param {String} dashboardState - The Base64-encoded state string of the new dashboard.
   * @param {String} imageHash - The numeric hash of the dashboard thumbnail.
   * @param {String} metaData - Stringified metadata related to the view.
   * @return {Promise} Returns empty if successful, rejects if any client failed.
   *
   * @example <caption>Replace a dashboard on the server:</caption>
   *
   * con.replaceDashboardAsync(123, 'replaceSave', 'owner', 'dashboardstateBase64', null, 'metaData').then(res => console.log(res))
   */
  replaceDashboardAsync = this.handleErrors(
    this.wrapThrift("replace_dashboard", this.overAllClients, (args) => args)
  )

  /**
   * Delete a dashboard object containing a value for the <code>view_state</code> property.
   * @param {Number} dashboardId - The ID of the dashboard.
   * @return {Promise} Returns empty if successful, rejects if any client failed.
   *
   * @example <caption>Delete a specific dashboard from the server:</caption>
   *
   * con.deleteDashboardAsync(123).then(res => console.log(res))
   */
  deleteDashboardAsync = this.handleErrors(
    this.wrapThrift("delete_dashboard", this.overAllClients, (args) => args)
  )

  /**
   * Delete multiple dashboards
   * @param {Array} dashboardIds - An array of dashboard ids (numbers)
   * @return {Promise} Returns empty if successful, rejects if any client failed.
   *
   * @example <caption>Delete dashboards from the server:</caption>
   *
   * con.deleteDashboardsAsync([123, 456]).then(res => console.log(res))
   */
  deleteDashboardsAsync = this.handleErrors(
    this.wrapThrift("delete_dashboards", this.overAllClients, (args) => args)
  )

  /**
   * Share a dashboard (GRANT a certain set of permissions to a specified list of groups).
   * @param {Number} dashboardId - The ID of the dashboard.
   * @param {String[]} groups - The roles and users that can access the dashboard.
   * @param {String[]} objects - The database objects (tables) that groups can see.
   * @param {String[]} permissions - Permissions granted to the groups.
   * @return {Promise} Returns empty if successful.
   *
   * @example <caption>Share a dashboard:</caption>
   *
   * con.shareDashboardAsync(123, ['group1', 'group2'], ['object1', 'object2'], ['perm1', 'perm2']).then(res => console.log(res))
   */
  shareDashboardAsync = this.handleErrors(
    this.wrapThrift(
      "share_dashboard",
      this.overAllClients,
      ([dashboardId, groups, objects, permissions]) => [
        dashboardId,
        groups,
        objects,
        new TDashboardPermissions(permissions)
      ]
    )
  )

  /**
   * Share multiple dashboards.
   * @param {Array} dashboardIds - An array of dashboard ids (numbers)
   * @param {String[]} groups - The roles and users that can access the dashboard.
   * @param {String[]} permissions - Permissions granted to the groups.
   * @return {Promise} Returns empty if successful.
   *
   * @example <caption>Share dashboards:</caption>
   *
   * con.shareDashboardsAsync([123, 456], ['group1', 'group2'], ['perm1', 'perm2']).then(res => console.log(res))
   */
  shareDashboardsAsync = this.handleErrors(
    this.wrapThrift(
      "share_dashboards",
      this.overAllClients,
      ([dashboardIds, groups, permissions]) => [
        dashboardIds,
        groups,
        new TDashboardPermissions(permissions)
      ]
    )
  )

  /**
   * Stop sharing a dashboard (REVOKE a certain set of permission from a specified list of groups).
   * @param {Number} dashboardId - The ID of the dashboard.
   * @param {String[]} groups - The roles and users that can access it.
   * @param {String[]} objects - The database objects (tables) that groups can see.
   * @param {String[]} permissions - Permissions revoked from the groups.
   * @return {Promise} Returns empty if successful.
   *
   * @example <caption>Unshare a dashboard:</caption>
   *
   * con.unshareDashboardAsync(123, ['group1', 'group2'], ['object1', 'object2'], ['perm1', 'perm2']).then(res => console.log(res))
   */
  unshareDashboardAsync = this.handleErrors(
    this.wrapThrift(
      "unshare_dashboard",
      this.overAllClients,
      ([dashboardId, groups, objects, permissions]) => [
        dashboardId,
        groups,
        objects,
        new TDashboardPermissions(permissions)
      ]
    )
  )

  /**
   * Unshare multiple dashboards.
   * @param {Number[]} dashboardIds - An array of dashboard ids
   * @param {String[]} groups - The roles and users to unshare with.
   * @param {String[]} permissions - The permissions to remove.
   * @return {Promise} Returns empty if successful.
   *
   * @example <caption>Unshare dashboards:</caption>
   *
   * con.unshareDashboardsAsync([123, 456], ['group1', 'group2'], ['perm1', 'perm2']).then(res => console.log(res))
   */
  unshareDashboardsAsync = this.handleErrors(
    this.wrapThrift(
      "unshare_dashboards",
      this.overAllClients,
      ([dashboardIds, groups, permissions]) => [
        dashboardIds,
        groups,
        new TDashboardPermissions(permissions)
      ]
    )
  )

  /**
   * Get the list of users that a dashboard has been shared with; that is, those users who have been granted permissions to the dashboard.
   * @param {Number} dashboardId - The ID of the dashboard.
   * @return {Promise} Returns the list of users (array).
   *
   * @example <caption>Get the list of grantees for a dashboard:</caption>
   *
   * con.getDashboardGranteesAsync(123).then(res => console.log(res))
   */
  getDashboardGranteesAsync = this.handleErrors(
    this.wrapThrift(
      "get_dashboard_grantees",
      this.overSingleClient,
      (args) => args
    )
  )

  /**
   * Get a list of database objects granted to a role; that is, those objects the role has permissions to access.
   * @param {String} roleName - The name of the role.
   * @return {Promise} Returns the list of database object names (strings).
   *
   * @example <caption>Get list of accessible database objects for a role:</caption>
   *
   * con.getDbObjectsForGranteeAsync('role').then(res => console.log(res))
   */
  getDbObjectsForGranteeAsync = this.handleErrors(
    this.wrapThrift(
      "get_db_objects_for_grantee",
      this.overSingleClient,
      (args) => args
    )
  )

  /**
   * Get the privileges for the current user for a specified database object type and ID.
   * @param {String} objectName - The ID of the object (e.g. table name or dashboard ID).
   * @param {TDBObjectType} type - The type of the database object.
   * @return {Promise.<TDBObject[]>} Returns the list of database objects for this type and ID, including their privs (property 'privs').
   *
   * @example <caption>Get the list of accessible database objects for the current user:</caption>
   *
   * con.getDbObjectPrivsAsync('table_name', 'TableDBObjectType').then(res => console.log(res))
   */
  getDbObjectPrivsAsync = this.handleErrors(
    this.wrapThrift(
      "get_db_object_privs",
      this.overSingleClient,
      ([objectName, type]) => [objectName, TDBObjectType[type]]
    )
  )

  /**
   * Get all the roles assigned directly to a given username.
   * @param {String} username - The username whose roles you wish to get.
   * @return {Promise} A list of all roles assigned to the username.
   */
  getAllRolesForUserAsync = this.handleErrors(
    this.wrapThrift(
      "get_all_roles_for_user",
      this.overSingleClient,
      (args) => args
    )
  )

  /**
   * Get all the roles assigned to a given username recursively (ie, roles
   * assigned to the user, and roles assigned to those roles, and so on).
   * @param {String} username - The username whose roles you wish to get.
   * @return {Promise} A list of all roles assigned to the username.
   */
  getAllEffectiveRolesForUserAsync = this.handleErrors(
    this.wrapThrift(
      "get_all_effective_roles_for_user",
      this.overSingleClient,
      (args) => args
    )
  )

  /**
   * Checks if the given user or role has a privilege(s) on a given object. Note that this check is
   * transative; if a user has been granted a privilege via a role, this will return `true`.
   * @param {String} granteeName - The name of the user or role to check privileges for.
   * @param {String} objectName - The name of the object to check privileges against (for example,
   * the database name, table name, etc.)
   * @param {TDBObjectType} objectType - The type of object to check privileges against.
   * @param {TDBObjectPermissions} permissions - An object containing the privileges to check. All
   * the privileges specified must be granted for this function to return true.
   * @return {Boolean} true if all the specified privileges have been granted to the user/role,
   * false otherwise.
   *
   * @example <caption>Check if user <code>my_user</code> has the "view SQL Editor" privilege on the <code>my_db</code> database:</caption>
   *
   * con.hasDbPrivilegesAsync(
   *   "my_user",
   *   "my_db",
   *   TDBObjectType.DatabaseDBObjectType,
   *   new TDBObjectPermissions({
   *     database_permissions_: new TDatabasePermissions(dbPrivs)
   *   })
   * ).then((res) =>
   *   if(res) { console.log("Can view the SQL editor") }
   * )
   */
  hasObjectPrivilegesAsync = this.handleErrors(
    this.wrapThrift(
      "has_object_privilege",
      this.overSingleClient,
      (args) => args
    )
  )

  /**
   * Specialization of `has_object_privilege` for checking database privileges of a user.
   *
   * @param {String} granteeName - The name of the user or role to check privileges for.
   * @param {String} dbName - The name of the database to check user privileges against.
   * @param {TDatabasePermissions} dbPrivs - An object specifying what privileges to check.
   *
   * @return {Boolean} true if the user/role has all the specified DB privileges, false otherwise.
   *
   * @example <caption>Check if user <code>my_user</code> has the "view SQL Editor" privilege on the <code>my_db</code> database:</caption>
   *
   * con.hasDbPrivilegesAsync("my_user", "my_db", {view_sql_editor_: true}).then(res =>
   *  if(res) { console.log("Can view the SQL editor") }
   * )
   */
  hasDbPrivilegesAsync = (granteeName, dbName, dbPrivs) =>
    this.hasObjectPrivilegesAsync(
      granteeName,
      dbName,
      TDBObjectType.DatabaseDBObjectType,
      new TDBObjectPermissions({
        database_permissions_: new TDatabasePermissions(dbPrivs)
      })
    )

  getSessionInfoAsync = this.handleErrors(
    this.wrapThrift("get_session_info", this.overSingleClient, (args) => args)
  )

  createCustomExpressionAsync = this.handleErrors(
    this.wrapThrift(
      "create_custom_expression",
      this.overSingleClient,
      (args) => args
    )
  )

  getCustomExpressionsAsync = this.handleErrors(
    this.wrapThrift(
      "get_custom_expressions",
      this.overSingleClient,
      (args) => args
    )
  )

  updateCustomExpressionAsync = this.handleErrors(
    this.wrapThrift(
      "update_custom_expression",
      this.overSingleClient,
      (args) => args
    )
  )

  deleteCustomExpressionsAsync = this.handleErrors(
    this.wrapThrift(
      "delete_custom_expressions",
      this.overSingleClient,
      (args) => args
    )
  )

  /**
   * Asynchronously get data from an importable file,
   * such as a CSV or plaintext file with a header.
   * @param {String} fileName - The name of the importable file.
   * @param {TCopyParams} copyParams See {@link TCopyParams}
   * @returns {Promise.<TDetectResult>} An object that has <code>copy_params</code> and <code>row_set</code>.
   *
   * @example <caption>Get data from table_data.csv:</caption>
   *
   * var copyParams = new TCopyParams();
   * con.detectColumnTypesAsync('table_data.csv', copyParams).then(res => console.log(res))
   * // TDetectResult {row_set: TRowSet, copy_params: TCopyParams}
   *
   */
  detectColumnTypesAsync = this.handleErrors((filename, copyParams) => {
    const detectColumnTypes = this.wrapThrift(
      "detect_column_types",
      this.overSingleClient,
      () => [filename, helpers.convertObjectToThriftCopyParams(copyParams)]
    )
    return detectColumnTypes().then((res) => {
      this.importerRowDesc = res.row_set.row_desc
      return res
    })
  })

  /**
   * Submit a query to the database and process the results.
   * @param {String} query The query to perform.
   * @param {Object} options Options for the query.
   * @returns {Promise.Object} The result of the query.
   *
   * @example <caption>Create a query:</caption>
   *
   * var query = "SELECT count(*) AS n FROM tweets_nov_feb WHERE country='CO'";
   * var options = {};
   *
   * con.query(query, options).then((result) => console.log(result));
   */
  queryAsync = this.handleErrors((query, options) => {
    let columnarResults = true
    let eliminateNullRows = false
    let queryId = null
    let returnTiming = false
    let limit = -1
    let curNonce = (this._nonce++).toString()
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
      curNonce = options.hasOwnProperty("logValues")
        ? typeof options.logValues === "object"
          ? JSON.stringify(options.logValues)
          : options.logValues
        : curNonce
    }

    const lastQueryTime =
      queryId in this.queryTimes
        ? this.queryTimes[queryId]
        : this.DEFAULT_QUERY_TIME

    const conId = 0

    const processResultsOptions = {
      returnTiming,
      eliminateNullRows,
      query,
      queryId,
      conId,
      estimatedQueryTime: lastQueryTime,
      startTime: Date.now()
    }

    const AT_MOST_N = -1
    const sqlExecute = this.wrapThrift(
      "sql_execute",
      this.overSingleClient,
      (args) => args
    )
    const runQuery = () =>
      sqlExecute(query, columnarResults, curNonce, limit, AT_MOST_N).catch(
        (err) => {
          if (err.name === "NetworkError") {
            this.removeConnection(0)
            if (this._numConnections === 0) {
              err.msg = "No remaining database connections"
              throw err
            }
            return runQuery()
          }
          throw err
        }
      )

    return this.processResults(processResultsOptions, runQuery())
  })

  /**
   * Submit a query to the database and process the results.
   * @param {String} query The query to perform.
   * @param {Object} options Options for the query.
   * @param {Function} callback An optional callback function with the signature <code>(err, result) => result</code>.
   * @returns {Promise.Object} The result of the query.
   *
   * @example <caption>Create a query:</caption>
   *
   * var query = "SELECT count(*) AS n FROM tweets_nov_feb WHERE country='CO'";
   * var options = {};
   *
   * con.query(query, options, function(err, result) {
   *        console.log(result)
   *      });
   */
  query = this.callbackify("queryAsync", 2)

  queryDFAsync = this.handleErrors((query, options) => {
    const deviceId = 0
    const limit = -1

    const sqlExecuteDF = this.wrapThrift(
      "sql_execute_df",
      this.overSingleClient,
      () => [query, TDeviceType.CPU, deviceId, limit, TArrowTransport.WIRE]
    )

    return sqlExecuteDF().then((data) => {
      if (this._logging) {
        // eslint-disable-next-line no-console
        console.log(
          query,
          "on Server",
          0,
          "- Execution Time:",
          data.execution_time_ms,
          "ms"
        )
      }

      const buf = Buffer.from(data.df_buffer, "base64")
      let results = Table.from(buf)
      if (options && Boolean(options.returnTiming)) {
        results = {
          results,
          timing: {
            execution_time_ms: data.execution_time_ms
          }
        }
      }
      return results
    })
  })

  queryDF = this.callbackify("queryDFAsync", 2)

  /**
   * Submit a query to validate that the backend can create a result set based on the SQL statement.
   * @param {String} query The query to perform.
   * @returns {Promise.<Object>} The result of whether the query is valid.
   *
   * @example <caption>Create a query and determine if it is valid:</caption>
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
  validateQuery = this.handleErrors((query) => {
    const sqlValidate = this.wrapThrift(
      "sql_validate",
      this.overSingleClient,
      (args) => args
    )
    return sqlValidate(query).then((fields) => {
      const rowDict = fields.reduce((accum, value) => {
        accum[value.col_name] = value
        return accum
      }, {})
      return this.convertFromThriftTypes(rowDict)
    })
  })

  /**
   * Get the names of the databases that exist in the current session connection.
   * @return {Promise.<Object[]>} List of table objects containing the label and table names.
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
  getTablesAsync = this.handleErrors(() => {
    const getTables = this.wrapThrift(
      "get_tables",
      this.overSingleClient,
      (args) => args
    )
    return getTables().then((tables) =>
      tables.map((table) => ({
        name: table,
        label: "obs"
      }))
    )
  })

  /**
   * Get the names of the databases that exist in the current session connection.
   * @param {Function} callback An optional callback function with the signature <code>(err, result) => result</code>.
   * @return {Promise.<Object[]>} List of table objects containing the label and table names.
   *
   * @example <caption>Get the list of tables from a connection:</caption>
   *
   *  con.getTablesAsync((err, res) => console.log(res))
   *
   *  //  [{
   *  //    label: 'obs', // deprecated property
   *  //    name: 'myTableName'
   *  //   },
   *  //  ...]
   */
  getTables = this.callbackify("getTablesAsync", 0)

  /**
   * Get names and catalog metadata for tables that exist on the current session's connection.
   * @return {Promise.<Object[]>} The list of objects containing table metadata.
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
  getTablesWithMetaAsync = this.handleErrors(() => {
    const getTablesMeta = this.wrapThrift(
      "get_tables_meta",
      this.overSingleClient,
      (args) => args
    )
    return getTablesMeta().then((tables) =>
      tables.map((table) => ({
        name: table.table_name,
        num_cols: Number(table.num_cols.toString()),
        col_datum_types: table.col_types.map(
          (type) => this._datumEnum[type.type]
        ),
        is_view: table.is_view,
        is_replicated: table.is_replicated,
        shard_count: Number(table.shard_count.toString()),
        max_rows: isFinite(table.max_rows)
          ? Number(table.max_rows.toString())
          : -1
      }))
    )
  })

  getTablesWithMeta = this.callbackify("getTablesWithMetaAsync", 0)

  /**
   * Get names and catalog metadata for tables that exist on the current session's connection.
   * @return {Promise.<TTableMeta[]>} The list of objects containing table metadata.
   *
   * @example <caption>Get the list of tables with metadata from a connection:</caption>
   *
   *  con.getTablesMetaAsync().then(res => console.log(res))
   *
   *  [
   *   {
   *    table_name: 'my_table_name',
   *    col_datum_types: [TDatumType::BOOL, TDatumType::DOUBLE],
   *    col_names: ['bool_col', 'double_col'],
   *    is_view: false,
   *    is_replicated: false,
   *    shard_count: 0,
   *    max_rows: -1
   *   },
   *  ...]
   */
  getTablesMetaAsync = this.handleErrors(
    this.wrapThrift("get_tables_meta", this.overSingleClient, (args) => args)
  )

  getTablesMeta = this.callbackify("getTablesMetaAsync", 0)

  getTableEpochByNameAsync = this.handleErrors(
    this.wrapThrift(
      "get_table_epoch_by_name",
      this.overSingleClient,
      (args) => args
    )
  )

  getTableEpochByName = this.callbackify("getTableEpochByNameAsync", 0)

  /**
   * Submits an SQL string to the backend and returns a completion hints object.
   * @param {String} queryString A fragment of SQL input.
   * @param {Object} options An options object continaing the current cursor position, 1-indexed from the start of `queryString`.
   * @returns {Promise.Array} An array of completion hints objects that contains the completion hints.
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
  getCompletionHintsAsync = this.handleErrors(
    this.wrapThrift(
      "get_completion_hints",
      this.overSingleClient,
      ([queryString, { cursor }]) => [queryString, cursor]
    )
  )

  /**
   * Submits an SQL string to the backend and returns a completion hints object.
   * @param {String} queryString A fragment of SQL input.
   * @param {Object} options An options object continaing the current cursor position, 1-indexed from the start of `queryString`.
   * @param {Function} callback An optional callback function with the signature `(err, result) => result`.
   * @returns {Promise.Array} An array of completion hints objects that contains the completion hints.
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
  getCompletionHints = this.callbackify("getCompletionHintsAsync", 2)

  // TODO: replace all these build* methods w/ a singular method that will map each type object
  buildTFileTypeMap = () => {
    for (const key in TFileType) {
      if (TFileType.hasOwnProperty(key)) {
        this.TFileTypeMap[TFileType[key]] = key
      }
    }
  }

  buildTImportHeaderRowMap = () => {
    for (const key in TImportHeaderRow) {
      if (TImportHeaderRow.hasOwnProperty(key)) {
        this.TImportHeaderRowMap[TImportHeaderRow[key]] = key
      }
    }
  }

  buildTEncodingTypeMap = () => {
    for (const encoding in TEncodingType) {
      if (TEncodingType.hasOwnProperty(encoding)) {
        this.TEncodingTypeMap[TEncodingType[encoding]] = encoding
      }
    }
  }

  buildTRasterPointTypeMap = () => {
    for (const key in TRasterPointType) {
      if (TRasterPointType.hasOwnProperty(key)) {
        this.TRasterPointTypeMap[TRasterPointType[key]] = key
      }
    }
  }

  buildTRasterPointTransformMap = () => {
    for (const key in TRasterPointTransform) {
      if (TRasterPointTransform.hasOwnProperty(key)) {
        this.TRasterPointTransformMap[TRasterPointTransform[key]] = key
      }
    }
  }

  buildTSourceTypeMap = () => {
    for (const key in TSourceType) {
      if (TSourceType.hasOwnProperty(key)) {
        this.TSourceTypeMap[TSourceType[key]] = key
      }
    }
  }

  /**
   * Create an array-like object from {@link TDatumType} by
   * changing the order of the string key and numerical value.
   *
   * @returns {Undefined} This function does not return anything.
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
   * Get a list of field objects for a specified table.
   * @param {String} tableName Name of table containing field names.
   * @return {Promise.Array<Object>} The formatted list of field objects.
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
  getFieldsAsync = this.handleErrors((tableName) => {
    const getTableDetails = this.wrapThrift(
      "get_table_details",
      this.overSingleClient,
      (args) => args
    )
    return getTableDetails(tableName).then((fields) => {
      if (fields) {
        const rowDict = fields.row_desc.reduce((accum, value) => {
          accum[value.col_name] = value
          return accum
        }, {})
        return {
          ...fields,
          columns: this.convertFromThriftTypes(rowDict)
        }
      } else {
        throw new Error(`Table (${tableName}) not found`)
      }
    })
  })

  /**
   * Get a list of field objects for a specified table.
   * @param {String} tableName Name of table containing field names.
   * @param {Function} callback An optional callback that takes (`err, results`).
   * @return {Promise.Array<Object>} The formatted list of field objects.
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
  getFields = this.callbackify("getFieldsAsync", 1)

  /**
   * Create a table and persist it to the backend.
   * @param {String} tableName The name of the new table.
   * @param {Array<TColumnType>} rowDescObj Fields in the new table.
   * @param {TCreateParams} createParams Properties to apply to the new table (e.g. replicated)
   * @return {Promise.<undefined>} Generates an error if unsuccessful, or returns undefined if successful.
   *
   * @example <caption>Create a new table:</caption>
   *
   *  con.createTable('mynewtable', [TColumnType, TColumnType, ...], 0).then(res => console.log(res));
   *  // undefined
   */
  createTableAsync = this.handleErrors(
    this.wrapThrift(
      "create_table",
      this.overAllClients,
      ([tableName, rowDescObj, createParams]) => [
        tableName,
        helpers.mutateThriftRowDesc(rowDescObj, this.importerRowDesc),
        createParams
      ]
    )
  )

  createTable = this.callbackify("createTableAsync", 4)

  /**
   * Import a delimited table from a file.
   * @param {String} tableName The name of the new table.
   * @param {String} fileName The name of the file containing the table.
   * @param {TCopyParams} copyParams See {@link TCopyParams}
   * @param {TColumnType[]} headers A collection of metadata related to the table headers.
   */
  importTableAsync = this.handleErrors(
    this.wrapThrift(
      "import_table",
      this.overAllClients,
      ([tableName, fileName, copyParams]) => [
        tableName,
        fileName,
        helpers.convertObjectToThriftCopyParams(copyParams)
      ]
    )
  )

  /**
   * Import a geo table from a file.
   * @param {String} tableName The name of the new geo table.
   * @param {String} fileName The name of the file containing the table.
   * @param {TCopyParams} copyParams See {@link TCopyParams}
   * @param {TColumnType[]} headers A colleciton of metadata related to the table headers.
   */
  importTableGeoAsync = this.handleErrors(
    this.wrapThrift(
      "import_geo_table",
      this.overAllClients,
      ([tableName, fileName, copyParams, rowDescObj]) => [
        tableName,
        fileName,
        helpers.convertObjectToThriftCopyParams(copyParams),
        helpers.mutateThriftRowDesc(rowDescObj, this.importerRowDesc),
        new TCreateParams()
      ]
    )
  )

  importTableAsyncWrapper(isShapeFile) {
    return isShapeFile
      ? this.importTableGeoAsync.bind(this)
      : this.importTableAsync.bind(this)
  }

  importTable(
    tableName,
    fileName,
    copyParams,
    rowDescObj,
    isShapeFile,
    callback
  ) {
    if (isShapeFile) {
      const func = this.callbackify("importTableGeoAsync", 4)
      return func(tableName, fileName, copyParams, rowDescObj, callback)
    } else {
      const func = this.callbackify("importTableAsync", 3)
      return func(tableName, fileName, copyParams, callback)
    }
  }

  /**
   * Use for backend rendering. This method fetches a PNG image that is a
   * render of the Vega JSON object. The Image will be a string if using
   * browser-connector.js, or a Buffer otherwise.
   *
   * @param {Number} widgetid The widget ID of the calling widget.
   * @param {String} vega The Vega JSON.
   * @param {Object} options The options for the render query.
   * @param {Number} options.compressionLevel The PNG compression level.
   *                  Range: 1 (low compression, faster) to 10 (high compression, slower).
   *                  Default: 3.
   * @returns {Promise.Image} Base64 image.
   */
  renderVegaAsync = this.handleErrors((widgetid, vega, options) => {
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

    let curNonce = (this._nonce++).toString()
    if (options) {
      curNonce = options.hasOwnProperty("logValues")
        ? typeof options.logValues === "object"
          ? JSON.stringify(options.logValues)
          : options.logValues
        : curNonce
    }

    const conId = 0
    this._lastRenderCon = conId

    const processResultsOptions = {
      isImage: true,
      query: `render: ${vega}`,
      queryId,
      conId,
      estimatedQueryTime: lastQueryTime
    }

    const renderVega = this.wrapThrift(
      "render_vega",
      this.overSingleClient,
      (args) => args
    )
    return this.processResults(
      processResultsOptions,
      renderVega(widgetid, vega, compressionLevel, curNonce)
    )
  })

  /**
   * Use for backend rendering. This method fetches a PNG image that is a
   * render of the Vega JSON object. The Image will be a string if using
   * browser-connector.js, or a Buffer otherwise.
   *
   * @param {Number} widgetid The widget ID of the calling widget.
   * @param {String} vega The Vega JSON.
   * @param {Object} options The options for the render query.
   * @param {Number} options.compressionLevel The PNG compression level.
   *                  Range: 1 (low compression, faster) to 10 (high compression, slower).
   *                  Default: 3.
   * @param {Function} callback An optional callback that takes `(err, success)` as its signature.
   * @returns {Promise.Image} Base64 image.
   */
  renderVega = this.callbackify("renderVegaAsync", 3)

  /**
   * Used primarily for backend-rendered maps; fetches the row
   * for a specific table that was last rendered at a pixel.
   *
   * @param {Number} widgetId The widget ID of the caller.
   * @param {TPixel} pixel The pixel. The lower-left corner is pixel (0,0).
   * @param {Object} tableColNamesMap Map of the object of `tableName` to the array of column names.
   * @param {Number} [pixelRadius=2] The radius around the primary pixel to search within.
   * @returns {String} Current result nonce
   */
  getResultRowForPixelAsync = this.handleErrors(
    (widgetId, pixel, tableColNamesMap, pixelRadius = 2) => {
      if (!(pixel instanceof TPixel)) {
        pixel = new TPixel(pixel)
      }

      const columnFormat = true // BOOL
      const curNonce = (this._nonce++).toString()

      return this._client[this._lastRenderCon]
        .get_result_row_for_pixel(
          this._sessionId[this._lastRenderCon],
          widgetId,
          pixel,
          tableColNamesMap,
          columnFormat,
          pixelRadius,
          curNonce
        )
        .then((results) => {
          results = Array.isArray(results) ? results.pixel_rows : [results]

          const processResultsOptions = {
            isImage: false,
            eliminateNullRows: false,
            query: "pixel request",
            queryId: -2
          }
          const processor = processQueryResults(
            this._logging,
            this.updateQueryTimes
          )

          const numPixels = results.length
          for (let p = 0; p < numPixels; p++) {
            results[p].row_set = processor(
              processResultsOptions,
              this._datumEnum,
              results[p]
            )
          }

          return results
        })
    }
  )

  /**
   * Used primarily for backend-rendered maps; fetches the row
   * for a specific table that was last rendered at a pixel.
   *
   * @param {Number} widgetId The widget ID of the caller.
   * @param {TPixel} pixel The pixel. The lower-left corner is pixel (0,0).
   * @param {Object} tableColNamesMap Map of the object of `tableName` to the array of column names.
   * @param {Number} [pixelRadius=2] The radius around the primary pixel to search within.
   * @param {Function} callback An optional callback function with the signature `(err, result) => result`.
   * @returns {String} Current result nonce
   */
  getResultRowForPixel = this.callbackify("getResultRowForPixelAsync", 4)

  // ** Configuration methods **

  /**
   * Get or set the session ID used by the server to serve the correct data.
   * This is typically set by {@link connect} and should not be set manually.
   * @param {Number} sessionId The session ID of the current connection.
   * @return {Number|MapdCon} - The session ID or MapD connector itself.
   *
   * @example <caption>Get the session ID:</caption>
   *
   *  con.sessionId();
   * // sessionID === 3145846410
   *
   * @example <caption>Set the session ID:</caption>
   * var con = new MapdCon().connect().sessionId(3415846410);
   * // NOTE: It is generally unsafe to set the session ID manually.
   */
  sessionId(sessionId) {
    if (!arguments.length) {
      return this._sessionId
    }
    this._sessionId = arrayify(sessionId)
    return this
  }

  useBinaryProtocol(use) {
    if (!arguments.length) {
      return this._useBinaryProtocol
    }
    this._useBinaryProtocol = Boolean(use)
    return this
  }

  /**
   * Get or set the connection server hostname.
   * This is is typically the first method called after instantiating a new MapdCon.
   * @param {String} host The hostname address.
   * @return {String|MapdCon} The hostname or MapD connector itself.
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
   * @param {String} port - The port to connect on.
   * @return {String|MapdCon} - The port or MapD connector itself.
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
   * Get or set the username with which to authenticate.
   * @param {String} user - The username with which to authenticate.
   * @return {String|MapdCon} - The username or MapD connector itself.
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
   * Get or set the user password for authentication.
   * @param {String} password The password with which to authenticate.
   * @return {String|MapdCon} The password or MapD connector itself.
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
   * @param {String} dbName - The database to connect to.
   * @return {String|MapdCon} - The name of the database or the MapD connector itself.
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
   * Configure whether raw query strings are logged to the console.
   * Used primarily for debugging; `false` by default.
   * @param {Boolean} logging Set to true to enable logging.
   * @return {Boolean|MapdCon} The current logging flag or MapD connector itself.
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
   * @param {String} platform The platform; "mapd" by default.
   * @return {String|MapdCon} - The platform or MapD connector itself.
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
   * @return {Number} The number of open connections.
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
   * @param {String} protocol <code>http</code> or <code>https</code>.
   * @return {String|MapdCon} The protocol or MapdCon itself.
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
   * Disables logic that automatically tries to reconnect to the server if there's an error
   *
   * @param {Boolean?} disable - If true, disables auto-reconnect
   * @return {Boolean|MapdCon} The status of auto-reconnect, or MapdCon itself.
   */
  disableAutoReconnect(disable) {
    if (!arguments.length) {
      return this._disableAutoReconnect
    }
    this._disableAutoReconnect = disable
    return this
  }

  /**
   * Generates a list of endpoints from the connection parameters.
   * @return {Array<String>} List of endpoints.
   *
   * @example <caption>Get the endpoints:</caption>
   * var con = new MapdCon().protocol('http').host('localhost').port('8000');
   * var endpoints = con.getEndpoints();
   * // endpoints === [ 'http://localhost:8000' ]
   */
  getEndpoints() {
    return this._host.map(
      (host, i) => `${this._protocol[i]}://${host}:${this._port[i]}`
    )
  }

  /**
   * Set the license for Trial or Enterprise
   * @param {String} key The key to install
   * @param {Object} config Protocol, host and port to connect to
   * @return {Promise.<Object>} Claims or Error.
   */
  setLicenseKey(key, { protocol, host, port }) {
    let client = Array.isArray(this._client) && this._client[0]
    let sessionId = this._sessionId && this._sessionId[0]
    if (!client) {
      const url = `${protocol}://${host}:${port}`
      client = buildClient(url, this._useBinaryProtocol)
      sessionId = ""
    }
    return client.set_license_key(sessionId, key, this._nonce++)
  }

  /**
   * Get the license for Trial or Enterprise
   * @param {Object} config Protocol, host and port to connect to
   * @return {Promise.<Object>} Claims or Error.
   */
  getLicenseClaims({ protocol, host, port }) {
    let client = Array.isArray(this._client) && this._client[0]
    let sessionId = this._sessionId && this._sessionId[0]
    if (!client) {
      const url = `${protocol}://${host}:${port}`
      client = buildClient(url, this._useBinaryProtocol)
      sessionId = ""
    }
    return client.get_license_claims(sessionId, this._nonce++)
  }

  isTimeoutError(result) {
    return (
      result instanceof TDBException &&
      (String(result.error_msg).indexOf("Session not valid.") !== -1 ||
        String(result.error_msg).indexOf("User should re-authenticate.") !== -1)
    )
  }
}

export default MapdCon

export * from "../thrift/OmniSci"
export * from "../thrift/common_types"
export * from "../thrift/completion_hints_types"
export * from "../thrift/extension_functions_types"
export * from "../thrift/omnisci_types"
export * from "../thrift/serialized_result_set_types"
