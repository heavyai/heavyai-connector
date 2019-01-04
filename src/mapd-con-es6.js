/* global TDashboardPermissions: false, TDBObjectType: false, TDBObjectPermissions: false, TDatabasePermissions: false */

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

import EventEmitter from "eventemitter3"

import MapDClientV2 from "./mapd-client-v2"
import processQueryResults from "./process-query-results"

const COMPRESSION_LEVEL_DEFAULT = 3

function arrayify(maybeArray) {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray]
}

function isNodeRuntime() {
  return typeof window === "undefined"
}

function isTimeoutError(result) {
  return (
    result instanceof window.TMapDException &&
    (String(result.error_msg).indexOf("Session not valid.") !== -1 ||
      String(result.error_msg).indexOf("User should re-authenticate.") !== -1)
  )
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

    this.processResults = (options = {}, result, error, callback) => {
      if (error) {
        if (this._logging && options.query) {
          console.error(options.query, "\n", error)
        }
        callback(error)
      } else {
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
    }

    // return this to allow chaining off of instantiation
    return this
  }

  /**
   * Create a connection to the MapD server, generating a client and session ID.
   * @param {Function} callback A callback that takes `(err, success)` as its signature.  Returns con singleton if successful.
   * @return {MapdCon} Object.
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
          "createTableAsync",
          "dbName",
          "detectColumnTypesAsync",
          "disconnect",
          "getCompletionHintsAsync",
          "getFields",
          "getDashboardAsync",
          "getDashboardsAsync",
          "getResultRowForPixel",
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

  connectAsync = () =>
    new Promise((resolve, reject) => {
      this.connect((error, con) => {
        if (error) {
          reject(error)
        } else {
          resolve(con)
        }
      })
    })

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
   * @param {Function} callback A callback that takes `(err, success)` as its signature.  Returns con singleton if successful.
   * @return {MapdCon} Object.
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
          if (error && !isTimeoutError(error)) {
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

  // ** Method wrappers **

  handleErrors = method => (...args) =>
    new Promise((resolve, reject) => {
      const success = result => resolve(result)
      const failure = error => {
        this.events.emit("error", error)
        return reject(error)
      }

      const promise = method.apply(this, args)

      promise.then(success).catch(error => {
        if (isTimeoutError(error)) {
          // Reconnect, then try the method once more
          return this.connectAsync().then(() => {
            const retriedPromise = method.apply(this, args)

            retriedPromise.then(success).catch(failure)
          })
        } else {
          return failure(error)
        }
      })
    })

  promisifyThriftMethod = (client, sessionId, methodName, args) =>
    new Promise((resolve, reject) => {
      client[methodName].apply(
        client,
        [sessionId].concat(args, result => {
          if (result instanceof Error) {
            reject(result)
          } else {
            resolve(result)
          }
        })
      )
    })

  overSingleClient = "SINGLE_CLIENT"
  overAllClients = "ALL_CLIENTS"

  // Wrap a Thrift method to perform session check and mapping over
  // all clients (for mutating methods)
  wrapThrift = (methodName, overClients, processArgs) => (...args) => {
    if (this._sessionId) {
      const processedArgs = processArgs(args)

      if (overClients === this.overSingleClient) {
        return this.promisifyThriftMethod(
          this._client[0],
          this._sessionId[0],
          methodName,
          processedArgs
        )
      } else {
        return Promise.all(
          this._client.map((client, index) =>
            this.promisifyThriftMethod(
              client,
              this._sessionId[index],
              methodName,
              processedArgs
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

  // ** Client methods **

  getStatus = callback => {
    this._client[0].get_status(this._sessionId[0], callback)
  }

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
    () =>
      new Promise((resolve, reject) => {
        this.getStatus((err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        })
      })
  )

  getHardwareInfo = callback => {
    this._client[0].get_hardware_info(this._sessionId[0], callback)
  }

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
    () =>
      new Promise((resolve, reject) => {
        this.getHardwareInfo((err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        })
      })
  )

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
      args => args
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
    this.wrapThrift("get_users", this.overSingleClient, args => args)
  )

  importTableStatusAsync = this.handleErrors(
    this.wrapThrift("import_table_status", this.overSingleClient, args => args)
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
    this.wrapThrift("get_roles", this.overSingleClient, args => args)
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
    this.wrapThrift("get_dashboards", this.overSingleClient, args => args)
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
    this.wrapThrift("get_dashboard", this.overSingleClient, args => args)
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
    this.wrapThrift("create_dashboard", this.overAllClients, args => args)
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
    this.wrapThrift("replace_dashboard", this.overAllClients, args => args)
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
    this.wrapThrift("delete_dashboard", this.overAllClients, args => args)
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
      args => args
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
      args => args
    )
  )

  /**
   * Get the privileges for the current user for a specified database object.
   * @param {String} objectName - The name or ID of the object.
   * @param {TDBObjectType} type - The type of the database object.
   * @return {Promise} Returns the list of database object names (strings).
   *
   * @example <caption>Get the list of accessible database objects for a role:</caption>
   *
   * con.getDbObjectsForGranteeAsync('role').then(res => console.log(res))
   */
  getDbObjectPrivsAsync = this.handleErrors(
    this.wrapThrift(
      "get_db_object_privs",
      this.overSingleClient,
      ([objectName, type]) => [objectName, TDBObjectType[type]]
    )
  )

  /**
   * Get all the roles assigned to a given username.
   * @param {String} username - The username whose roles you wish to get.
   * @return {Promise} A list of all roles assigned to the username.
   */
  getAllRolesForUserAsync = this.handleErrors(
    this.wrapThrift(
      "get_all_roles_for_user",
      this.overSingleClient,
      args => args
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
      ([granteeName, objectName, objectType, permissions]) => [
        granteeName,
        objectName,
        objectType,
        permissions
      ]
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
  detectColumnTypesAsync = this.handleErrors(
    (fileName, copyParams) =>
      new Promise((resolve, reject) => {
        this.detectColumnTypes.bind(this, fileName, copyParams)((err, res) => {
          if (err) {
            reject(err)
          } else {
            this.importerRowDesc = res.row_set.row_desc
            resolve(res)
          }
        })
      })
  )

  /**
   * Submit a query to the database and process the results.
   * @param {String} query The query to perform.
   * @param {Object} options Options for the query.
   * @param {Function} callback A callback function with the signature <code>(err, result) => result</code>.
   * @returns {Object} The result of the query.
   *
   * @example <caption>Create a query:</caption>
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
            this.processResults(processResultsOptions, result, error, callback)
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

  queryAsync = this.handleErrors(
    (query, options) =>
      new Promise((resolve, reject) => {
        this.query(query, options, (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        })
      })
  )

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
  validateQuery = this.handleErrors(
    query =>
      new Promise((resolve, reject) => {
        this._client[0].sql_validate(
          this._sessionId[0],
          query,
          (error, res) => {
            if (error) {
              reject(error)
            } else {
              resolve(this.convertFromThriftTypes(res))
            }
          }
        )
      })
  )

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
  getTablesAsync = this.handleErrors(
    () =>
      new Promise((resolve, reject) => {
        this.getTables.bind(this)((error, tables) => {
          if (error) {
            reject(error)
          } else {
            resolve(tables)
          }
        })
      })
  )

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
            col_datum_types: table.col_datum_types.map(
              type => this._datumEnum[type]
            ),
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
  getTablesWithMetaAsync = this.handleErrors(
    () =>
      new Promise((resolve, reject) => {
        this.getTablesWithMeta.bind(this)((error, tables) => {
          if (error) {
            reject(error)
          } else {
            resolve(tables)
          }
        })
      })
  )

  /**
   * Submits an SQL string to the backend and returns a completion hints object.
   * @param {String} queryString A fragment of SQL input.
   * @param {Object} options An options object continaing the current cursor position, 1-indexed from the start of `queryString`.
   * @param {Function} callback A callback function with the signature `(err, result) => result`.
   * @returns {Array} An array of completion hints objects that contains the completion hints.
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
   * @param {Function} callback A callback that takes (`err, results`).
   * @return {Array<Object>} The formatted list of field objects.
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

  getFieldsAsync = this.handleErrors(
    tableName =>
      new Promise((resolve, reject) => {
        this.getFields(tableName, (error, fields) => {
          if (error) {
            reject(error)
          } else {
            resolve(fields)
          }
        })
      })
  )

  createTable(tableName, rowDescObj, tableType, createParams, callback) {
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
        createParams,
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
   * @param {String} tableName The name of the new table.
   * @param {Array<TColumnType>} rowDescObj Fields in the new table.
   * @param {Number<TTableType>} tableType The types of tables a user can import into the database.
   * @param {TCreateParams} createParams Properties to apply to the new table (e.g. replicated)
   * @return {Promise.<undefined>} Generates an error if unsuccessful, or returns undefined if successful.
   *
   * @example <caption>Create a new table:</caption>
   *
   *  con.createTable('mynewtable', [TColumnType, TColumnType, ...], 0).then(res => console.log(res));
   *  // undefined
   */
  createTableAsync = this.handleErrors(
    (tableName, rowDescObj, tableType, createParams) =>
      new Promise((resolve, reject) => {
        this.createTable(
          tableName,
          rowDescObj,
          tableType,
          createParams,
          err => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          }
        )
      })
  )

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
   * @param {String} tableName The name of the new table.
   * @param {String} fileName The name of the file containing the table.
   * @param {TCopyParams} copyParams See {@link TCopyParams}
   * @param {TColumnType[]} headers A collection of metadata related to the table headers.
   */
  importTableAsync = this.handleErrors(this.importTableAsyncWrapper(false))

  /**
   * Import a geo table from a file.
   * @param {String} tableName The name of the new geo table.
   * @param {String} fileName The name of the file containing the table.
   * @param {TCopyParams} copyParams See {@link TCopyParams}
   * @param {TColumnType[]} headers A colleciton of metadata related to the table headers.
   */
  importTableGeoAsync = this.handleErrors(this.importTableAsyncWrapper(true))

  /**
   * Use for backend rendering. This method fetches a PNG image
   * that is a render of the Vega JSON object.
   *
   * @param {Number} widgetid The widget ID of the calling widget.
   * @param {String} vega The Vega JSON.
   * @param {Object} options The options for the render query.
   * @param {Number} options.compressionLevel The PNG compression level.
   *                  Range: 1 (low compression, faster) to 10 (high compression, slower).
   *                  Default: 3.
   * @param {Function} callback Takes `(err, success)` as its signature.  Returns con singleton if successful.
   *
   * @returns {Image} Base64 image.
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
        this.processResults(processResultsOptions, result, error, callback)
      }
    )

    return curNonce
  }

  renderVegaAsync = this.handleErrors(
    (widgetid, vega, options) =>
      new Promise((resolve, reject) => {
        this.renderVega(widgetid, vega, options, (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        })
      })
  )

  /**
   * Used primarily for backend-rendered maps; fetches the row
   * for a specific table that was last rendered at a pixel.
   *
   * @param {Number} widgetId The widget ID of the caller.
   * @param {TPixel} pixel The pixel. The lower-left corner is pixel (0,0).
   * @param {Object} tableColNamesMap Map of the object of `tableName` to the array of column names.
   * @param {Number} [pixelRadius=2] The radius around the primary pixel to search within.
   * @param {Function} callback A callback function with the signature `(err, result) => result`.
   *
   * @returns {String} Current result nonce
   */
  getResultRowForPixel(
    widgetId,
    pixel,
    tableColNamesMap,
    pixelRadius = 2,
    callback = null
  ) /* istanbul ignore next */ {
    if (!(pixel instanceof TPixel)) {
      pixel = new TPixel(pixel)
    }

    const columnFormat = true // BOOL
    const curNonce = (this._nonce++).toString()

    if (!callback) {
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
      this.processPixelResults.bind(this, callback)
    )

    return curNonce
  }

  getResultRowForPixelAsync = this.handleErrors(
    (widgetId, pixel, tableColNamesMap, pixelRadius = 2) =>
      new Promise((resolve, reject) => {
        this.getResultRowForPixel(
          widgetId,
          pixel,
          tableColNamesMap,
          pixelRadius,
          (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve(result)
            }
          }
        )
      })
  )

  /**
   * Formats the pixel results into the same pattern as textual results.
   *
   * @param {Function} callback A callback function with the signature `(err, result) => result`.
   * @param {Object} error An error if thrown; otherwise null.
   * @param {Array|Object} results Unformatted results of pixel `rowId` information.
   *
   * @returns {Object} An object with the pixel results formatted for display.
   */
  processPixelResults(callback, error, results) {
    results = Array.isArray(results) ? results.pixel_rows : [results]

    if (error) {
      if (callback) {
        return callback(error, results)
      } else {
        throw new Error(
          `Unable to process result row for pixel results: ${error}`
        )
      }
    }

    const processResultsOptions = {
      isImage: false,
      eliminateNullRows: false,
      query: "pixel request",
      queryId: -2
    }

    const numPixels = results.length
    for (let p = 0; p < numPixels; p++) {
      results[p].row_set = this.processResults(
        processResultsOptions,
        results[p]
      )
    }

    if (callback) {
      return callback(error, results)
    } else {
      return results
    }
  }

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
    this._sessionId = sessionId
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
      (host, i) => this._protocol[i] + "://" + host + ":" + this._port[i]
    )
  }

  /**
   * Set the license for Trial or Enterprise
   * @param {String} key The key to install
   * @param {Object} config Protocol, host and port to connect to
   * @return {Promise.<Object>} Claims or Error.
   */
  setLicenseKey(key, { protocol, host, port }) {
    return new Promise(resolve => {
      let client = Array.isArray(this._client) && this._client[0]
      let sessionId = this._sessionId && this._sessionId[0]
      if (!client) {
        const url = `${protocol}://${host}:${port}`
        const thriftTransport = new Thrift.Transport(url)
        const thriftProtocol = new Thrift.Protocol(thriftTransport)
        client = new MapDClientV2(thriftProtocol)
        sessionId = ""
      }
      const result = client.set_license_key(sessionId, key, this._nonce++)
      resolve(result)
    })
  }

  /**
   * Get the license for Trial or Enterprise
   * @param {Object} config Protocol, host and port to connect to
   * @return {Promise.<Object>} Claims or Error.
   */
  getLicenseClaims({ protocol, host, port }) {
    return new Promise((resolve, reject) => {
      let client = Array.isArray(this._client) && this._client[0]
      let sessionId = this._sessionId && this._sessionId[0]
      if (!client) {
        const url = `${protocol}://${host}:${port}`
        const thriftTransport = new Thrift.Transport(url)
        const thriftProtocol = new Thrift.Protocol(thriftTransport)
        client = new MapDClientV2(thriftProtocol)
        sessionId = ""
      }
      try {
        const result = client.get_license_claims(sessionId, this._nonce++)
        resolve(result)
      } catch (e) {
        reject(e)
      }
    })
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
