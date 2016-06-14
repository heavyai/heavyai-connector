/* eslint block-scoped-var:0, vars-on-top:0, no-var:0, no-redeclare:0 */

const hasRequire = typeof require !== 'undefined';
const hasWindow = typeof window !== 'undefined';
const isNode = hasRequire && !hasWindow;

if (isNode && typeof Thrift === 'undefined') {
  var Thrift = require('thrift');
  Thrift.Transport = Thrift.TFramedTransport;
  Thrift.Protocol = Thrift.TBinaryProtocol;
}

if (isNode &&
    typeof TDatumType === 'undefined' &&
    typeof TEncodingType === 'undefined' &&
    typeof TDatumVal === 'undefined') {
  var MapdTypes = require('../thrift/node/mapd_types');
  var TDatumType = MapdTypes.TDatumType;
  var TDatumVal = MapdTypes.TDatumVal;
  var TEncodingType = MapdTypes.TEncodingType;
} else {
  var TDatumType = window.TDatumType;
  var TEncodingType = window.TEncodingType;
  var TDatumVal = window.TDatumVal;
}

if (isNode && typeof MapD === 'undefined') {
  var MapD = require('../thrift/node/mapd.thrift');
}

import { bindArgsFromN } from './MapdConUtils';
/**
 * The MapdCon class provides the necessary methods for performing queries to a
 * MapD GPU database. In order to use MapdCon, you must have the Thrift library
 * loaded into the <code>window</code> object first.
 */

export class MapdCon {

  /**
   * Create a new MapdCon and return it to allow method chaining.
   * @return {MapdCon} Object
   *
   * @example <caption>Create a new MapdCon instance:</caption>
   * var con = new MapdCon();
   *
   * @example <caption>Create a new MapdCon instance and set the host via method chaining:</caption>
   * var con = new MapdCon().host('http://hostname.com');
   */
  constructor() {
    this._host = null;
    this._user = null;
    this._password = null;
    this._port = null;
    this._dbName = null;
    this._client = null;
    this._sessionId = null;
    this._protocol = null;
    this._datumEnum = {};
    this._logging = false;
    this._platform = 'mapd';
    this._nonce = 0;
    this._balanceStrategy = 'adaptive';
    this._numConnections = 0;
    this._lastRenderCon = 0;
    this.queryTimes = { };
    this.serverQueueTimes = null;
    this.serverPingTimes = null;
    this.pingCount = null;
    this.DEFAULT_QUERY_TIME = 50;
    this.NUM_PINGS_PER_SERVER = 4;

    // invoke initialization methods
    this.invertDatumTypes();

    /** Deprecated */
    this.setHost = this.host;

    /** Deprecated */
    this.setPort = this.port;

    /** Deprecated */
    this.setDbName = this.dbName;

    /** Deprecated */
    this.setPlatform = this.platform;

    /** Deprecated */
    this.setUserAndPassword = (user, password) => {
      this._user = !Array.isArray(user) ? [user] : user;
      this._password = !Array.isArray(password) ? [password] : password;
      return this;
    };

    /** Deprecated */
    this.getPlatform = this.platform;

    /** Deprecated */
    this.getSessionId = this.sessionId;

    /** Deprecated */
    this.queryAsync = this.query;

    // return this to allow chaining off of instantiation
    return this;
  }

  /**
   * Create a connection to the server, generating a client and session id.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, sessionId)</code>.
   * @param {Function} [callback] - If provided, this function will be called with the sessionId
   *                                passed as an argument.
   * @return {MapdCon|undefined} MapdCon
   *
   * @example <caption>Browser - (sync) Connect to a MapD server:</caption>
   * var con = new MapdCon()
   *   .protocol('http')
   *   .host('localhost')
   *   .port('8080')
   *   .dbName('myDatabase')
   *   .user('foo')
   *   .password('bar');
   * try {
   *   con.connect();
   * // con.sessionId() === 2070686863
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Connect to a MapD server:</caption>
   * var con = new MapdCon()
   *   .protocol('http')
   *   .host('localhost')
   *   .port('8080')
   *   .dbName('myDatabase')
   *   .user('foo')
   *   .password('bar')
   *   .connect(function(sessionId) {
   *      if (sessionId instanceof Error) console.log(sessionId);
   *      // sessionId === 2070686863
   *   });
   *
   * @example <caption>Node - (async) Connect to a MapD server:</caption>
   * var con = new MapdCon()
   *   .protocol('http')
   *   .host('localhost')
   *   .port('8080')
   *   .dbName('myDatabase')
   *   .user('foo')
   *   .password('bar')
   *   .connect(function(err, sessionId) {
   *      if (err) console.log(err);
   *      // sessionId === 2070686863
   *   });
   */
  connect(callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the connect method.');
    }

    // Disconnect first if already connected
    const shouldDisconnectSync = this._sessionId && !callback;
    const shouldDisconnectAsync = this._sessionId && callback;
    if (shouldDisconnectSync) {
      this.disconnect();
    }
    if (shouldDisconnectAsync) {
      this.disconnect((result) => {
        if (result instanceof Error) {
          throw result;
        }
        this.connect(callback);
      });
      return;
    }

    // TODO: should be its own function
    const allAreArrays = Array.isArray(this._host) &&
      Array.isArray(this._port) &&
      Array.isArray(this._user) &&
      Array.isArray(this._password) &&
      Array.isArray(this._dbName);
    if (!allAreArrays) {
      throw new Error('All connection parameters must be arrays.');
    }

    this._client = [];
    this._sessionId = [];

    // now check to see if length of all arrays are the same and > 0
    const hostLength = this._host.length;
    if (hostLength < 1) {
      throw new Error('Must have at least one server to connect to.');
    }
    if (hostLength !== this._port.length ||
        hostLength !== this._user.length ||
        hostLength !== this._password.length ||
        hostLength !== this._dbName.length) {
      throw new Error('Array connection parameters must be of equal length.');
    }

    if (!this._protocol) {
      this._protocol = this._host.map(() => {
        return window.location.protocol.replace(':', '');
      });
    }

    const transportUrls = this.getEndpoints();
    let _sessionId;
    let client;
    for (let h = 0; h < hostLength; h++) {
      // node client
      if (isNode) {
        const connectOptions = {
          transport: Thrift.TBufferedTransport,
          protocol: Thrift.TJSONProtocol,
          path: '/',
          headers: { Connection: 'close' },
          https: this._protocol[h] === 'https',
        };
        const connection = Thrift.createHttpConnection(
          this._host[h],
          this._port[h],
          connectOptions
        );
        connection.on('error', _logError);
        client = Thrift.createClient(MapD, connection);
      }

      // browser client
      if (hasWindow) {
        const transport = new window.Thrift.Transport(transportUrls[h]);
        const protocol = new window.Thrift.Protocol(transport);
        client = new MapDClient(protocol);
      }

      // sync
      if (!callback) {
        try {
          _sessionId = client.connect(
            this._user[h],
            this._password[h],
            this._dbName[h]
          );
          this._client.push(client);
          this._sessionId.push(_sessionId);
        } catch (err) {
          throw err;
        } finally {
          return this; // eslint-disable-line consistent-return
        }
      }

      // async
      if (callback) {
        client.connect(
          this._user[h],
          this._password[h],
          this._dbName[h],
          isNode ? _cbNode.bind(this) : _cb.bind(this)
        );
      }

      function _cb(result) { // eslint-disable-line no-loop-func, no-inner-declarations
        if (result instanceof Error) {
          callback(result);
          return;
        }
        _sessionId = result;
        this._client.push(client);
        this._sessionId.push(_sessionId);
        callback(_sessionId);
      }

      function _cbNode(error, sessionId) { // eslint-disable-line no-loop-func, no-inner-declarations, max-len
        if (error) {
          callback(error, null);
          return;
        }
        _sessionId = sessionId;
        this._client.push(client);
        this._sessionId.push(_sessionId);
        callback(null, _sessionId);
      }
    }

    function _logError(err) {
      console.log(err);
    }

    // this._numConnections = this._client.length;
    // if (this._numConnections < 1) {  // need at least one server to connect to
    //   // clean up first
    //   this._client = null;
    //   this._sessionId = null;
    //   throw new Error('Could not connect to any servers in list.');
    // }
    // this.serverQueueTimes = Array.apply(
    //   null,
    //   Array(this._numConnections)
    // ).map(Number.prototype.valueOf, 0);
    // // only run ping servers if the caller gives a callback
    // // - this is a promise by them to wait until the callback returns to query
    // //   the database to avoid skewing the results
    // if (callback) {
    //   this.pingServers(callback);
    // }
    // return this;
  }

  /**
   * Disconnect all connections from the server.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, disconnected)</code>.
   * @param {Function} [callback] - If provided, this function will be called with a disconnected
   *                                status TRUE passed as an argument.
   * @return {MapdCon|undefined} Object
   *
   * @example <caption>Browser - (sync) Disconnect from the server:</caption>
   * try {
   *   con.disconnect();
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Disconnect from the server:</caption>
   * con.disconnect(function(disconnected) {
   *   if (disconnected instanceof Error) console.log(disconnected);
   *   // disconnected === true;
   * });
   *
   * @example <caption>Node - (async) Disconnect from the server:</caption>
   * con.disconnect(function(err, disconnected) {
   *   if (err) console.log(err);
   *   // disconnected === true;
   * });
   */
  disconnect(callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the disconnect method.');
    }

    const resetValues = _resetValues.bind(this);

    // disconnect if connected
    if (this._sessionId !== null) {
      this._client.forEach((client, i) => {
        // sync
        if (!callback) {
          client.disconnect(this._sessionId[i]);
          resetValues();
        }

        // async
        if (callback) {
          const cbNode = _cbNode.bind(this);
          client.disconnect(
            this._sessionId[i],
            isNode ? bindArgsFromN(cbNode, 2, i) : _cb.bind(this, i)
          );
        }
      });
    } else {
      if (isNode && callback) {
        callback(null, true);
      } else if (!isNode && callback) {
        callback(true);
      } else {
        return this;
      }
    }

    // return this for chaining if sync
    if (!callback) {
      return this;
    }

    function _cb(clientIndex) {
      if (clientIndex instanceof Error) {
        callback(clientIndex);
        return;
      }
      if (clientIndex === this._client.length - 1) {
        resetValues();
        callback(true);
      }
    }

    function _cbNode(error, clientIndex) {
      if (error) {
        callback(error, null);
        return;
      }
      if (clientIndex === this._client.length - 1) {
        resetValues();
        callback(null, true);
      }
    }

    function _resetValues() {
      this._sessionId = null;
      this._client = null;
      this._numConnections = 0;
      this.serverPingTimes = null;
    }
  }

  /**
   * TODO
   */
  pingServers(callback) {
    if (this._sessionId !== null) {
      this.serverPingTimes = Array.apply(
        null,
        Array(this._numConnections)
      ).map(Number.prototype.valueOf, 0);
      this.pingCount = 0;
      for (let c = 0; c < this._numConnections; c++) {
        for (let i = 0; i < this.NUM_PINGS_PER_SERVER; i++) {
          const startTime = new Date();
          this._client[c].get_server_status(
            this._sessionId[c],
            this.pingServersCallback.bind(this, startTime, c, callback)
          );
        }
      }
    }
  }

  /**
   * TODO
   */
  pingServersCallback(startTime, serverNum, callback) {
    const now = new Date();
    const duration = now - startTime;
    this.serverPingTimes[serverNum] += duration;
    this.pingCount++;
    if (this.pingCount === this._numConnections * this.NUM_PINGS_PER_SERVER) {
      this.pingCount = 0;
      for (let c = 0; c < this._numConnections; c++) {
        this.serverPingTimes[c] /= this.NUM_PINGS_PER_SERVER;
        // handicap each server based on its ping time
        // - this should be persistent as we never zero our times
        this.serverQueueTimes[c] += this.serverPingTimes[c];
      }
      console.log(this.serverQueueTimes);
      if (typeof callback !== 'undefined') {
        callback(this, this.serverQueueTimes);
      }
    }
  }

  /**
   * TODO
   */
  balanceStrategy(balanceStrategy) {
    if (!arguments.length) {
      return this._balanceStrategy;
    }
    this._balanceStrategy = balanceStrategy;
    return this;
  }

  /**
   * Get the frontend views as a list of <code>TFrontendView</code> objects.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, views)</code>.
   * @param {Function} [callback] - If provided, this function will be called with the views
   *                                passed as an argument.
   * @return {Array<TFrontendView>|undefined} - views
   *
   * @example <caption>Browser - (sync) Get the list of frontend views:</caption>
   * var views;
   * try {
   *   views = con.getFrontendViews();
   *   // views === [TFrontendView, TFrontendView, ..]
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Get the list of frontend views:</caption>
   * var views = con.getFrontendViews(function(views) {
   *   if (views instanceof Error) console.log(views);
   *   // views === [TFrontendView, TFrontendView, ...]
   * });
   *
   * @example <caption>Node - (async) Get the list of frontend views:</caption>
   * var views = con.getFrontendViews(function(err, views) {
   *   if (err) console.log(err);
   *   // views === [TFrontendView, TFrontendView, ...]
   * });
   */
  getFrontendViews(callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the getFrontendViews method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    // async
    if (callback) {
      this._client[0].get_frontend_views(
        this._sessionId[0],
        isNode ? _cbNode.bind(this) : _cb.bind(this)
      );
    }

    // sync
    if (!callback) {
      let result = null;
      try {
        result = this._client[0].get_frontend_views(this._sessionId[0]);
      } catch (err) {
        throw err;
      }
      return result;
    }

    function _cb(views) {
      callback(views);
    }

    function _cbNode(error, views) {
      if (error) {
        callback(error, null);
        return;
      }
      callback(null, views);
    }
  }

  /**
   * Get a dashboard object containing a value for the <code>view_state</code> property.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, view)</code>.
   * @param {String} viewName - the name of the dashboard
   * @param {Function} callback - If provided, this function will be called with the view
   *                              passed as an argument.
   * @return {TFrontendView|undefined} view
   *
   * @example <caption>Browser - (sync) Get a frontend view by name:</caption>
   * var view;
   * try {
   *   view = con.getFrontendView('my_frontend_view');
   * // view instanceof TFrontendView === true
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Get a frontend view by name:</caption>
   * con.getFrontendView('my_frontend_view', function(view) {
   *   if (view instanceof Error) console.log(view);
   *   // view instanceof TFrontendView === true
   * });
   *
   * @example <caption>Node - (async) Get a frontend view by name:</caption>
   * con.getFrontendView('my_frontend_view', function(err, view) {
   *   if (err) console.log(err);
   *   // view instanceof TFrontendView === true
   * });
   */
  getFrontendView(viewName, callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the getFrontendView method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    // async
    if (callback) {
      this._client[0].get_frontend_view(
        this._sessionId,
        viewName,
        isNode ? _cbNode.bind(this) : _cb.bind(this)
      );
    }

    // sync
    if (!callback) {
      let result = null;
      try {
        result = this._client[0].get_frontend_view(this._sessionId, viewName);
      } catch (err) {
        throw err;
      }
      return result;
    }

    function _cb(view) {
      callback(view);
    }

    function _cbNode(error, view) {
      if (error) {
        callback(error, null);
        return;
      }
      callback(null, view);
    }
  }

  /**
   * Get the status of the server as a <code>TServerStatus</code> object.
   * This includes whether the server is read-only,
   * has backend rendering enabled, and the version number.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, serverStatus)</code>.
   * @param {Function} [callback] - If provided, this function will be called with the serverStatus
   *                              passed as an argument.
   * @return {TServerStatus|undefined} serverStatus
   *
   * @example <caption>Browser - (sync) Get the server status:</caption>
   * var serverStatus;
   * try {
   *   serverStatus = con.getServerStatus();
   *   // serverStatus instanceof TServerStatus === true
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Get the server status:</caption>
   *  con.getServerStatus(function(serverStatus){
   *    if (serverStatus instanceof Error) console.log(serverStatus);
   *    // serverStatus instanceof TServerStatus === true
   *  });
   *
   * @example <caption>Node - (async) Get the server status:</caption>
   *  con.getServerStatus(function(err, serverStatus){
   *    if (err) console.log(err);
   *    // serverStatus instanceof TServerStatus === true
   *  });
   */
  getServerStatus(callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the getServerStatus method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    // async
    if (callback) {
      var cb = isNode ? _cbNode.bind(this) : _cb.bind(this);
      this._client[0].get_server_status(this._sessionId[0], cb);
    }

    // sync
    if (!callback) {
      let result = null;
      try {
        result = this._client[0].get_server_status(this._sessionId[0]);
      } catch (err) {
        throw err;
      }
      return result;
    }

    function _cb(serverStatus) {
      callback(serverStatus);
    }

    function _cbNode(error, serverStatus) {
      if (error) {
        callback(error, null);
        return;
      }
      callback(null, serverStatus);
    }
  }

  /**
   * Generate the image thumbnail hash used for saving frontend view.
   * @param {String} input - The string input to hash
   * @return {Number} hash - Numerical hash used for saving dashboards
   *
   * @example <caption>Generate an hash</caption>
   * var hash = generateImageThumbnailHashCode(Math.random().toString());
   * // hash === 3003444
   */
  generateImageThumbnailHashCode(input) {
    return input.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  // #<{(|*
  //  * Generate the state string used for saving frontend view.
  //  * @param {Object} state - The object containing the state
  //  * @param {Boolean} encode=false - Indicates whether to base64 encode the output string
  //  * @return {String} stateString - The string representation of the state object
  //  *
  //  * @example <caption>Generate a raw state string:</caption>
  //  * var state = generateViewStateString({id: 5});
  //  * // state === ''
  //  *
  //  * @example <caption>Generate an encoded state string:</caption>
  //  * var state = generateViewStateString({id: 5}, true);
  //  * // state === ''
  //  |)}>#
  // generateViewStateString(state, encode) {
  //   // TODO
  // }

  /**
   * Add a new frontend view to the server.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, viewName)</code>.
   * @param {String} viewName - the name of the new dashboard
   * @param {String} viewState - the base64-encoded state string of the new dashboard
   * @param {String} imageHash - the numeric hash of the dashboard thumbnail
   * @param {Function} [callback] - If provided, this function will be called with the viewName
   *                                passed as an argument.
   * @return {MapdCon|undefined} MapdCon
   *
   * @example <caption>Browser - (sync) Create a new frontend view on the server:</caption>
   * try {
   *   con.createFrontendView('newView', 'GlnaHRz...', '1906667617');
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Create a new frontend view on the server:</caption>
   * con.createFrontendView('newView', 'GlnaHRz...', '1906667617', function(viewName) {
   *   if (viewName instanceof Error) console.log(e);
   *   // viewName === 'newView';
   * });
   *
   * @example <caption>Node - (async) Create a new frontend view on the server:</caption>
   * con.createFrontendView('newView', 'GlnaHRz...', '1906667617', function(err, viewName) {
   *   if (err) console.log(err);
   *   // viewName === 'newView';
   * });
   */
  createFrontendView(viewName, viewState, imageHash, callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the createFrontendView method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    // sync
    if (!callback) {
      // do we want to try each one individually so if we fail we keep going?
      this._client.forEach((client, i) => {
        client.create_frontend_view(this._sessionId[i], viewName, viewState, imageHash);
      });
      return this;
    }

    // async
    if (callback) {
      const cbNode = _cbNode.bind(this);
      this._client.forEach((client, i) => {
        client.create_frontend_view(
          this._sessionId[i],
          viewName,
          viewState,
          imageHash,
          isNode ? bindArgsFromN(cbNode, 2, i) : _cb.bind(this, i)
        );
      });
    }

    function _cb(clientIndex) {
      if (clientIndex instanceof Error) {
        callback(clientIndex);
        return;
      }
      if (clientIndex === this._client.length - 1) {
        callback(viewName);
      }
    }

    function _cbNode(error, clientIndex) {
      if (error) {
        callback(error, null);
        return;
      }
      if (clientIndex === this._client.length - 1) {
        callback(null, viewName);
      }
    }
  }

  /**
   * Delete a frontend view from the server.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, viewName)</code>.
   * @param {String} viewName - the name of the dashboard
   * @param {Function} [callback] - If provided, this function will be called with the viewName
   *                                passed as an argument.
   * @return {MapdCon|undefined} MapdCon
   *
   * @example <caption>Browser - (sync) Delete a frontend view:</caption>
   * try {
   *   con.deleteFrontendView('my_view_name');
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Delete a frontend view:</caption>
   * con.deleteFrontendView('my_view_name', function(viewName) {
   *   if (viewName instanceof Error) console.log(e);
   *   // viewName === 'my_view_name'
   * });
   *
   * @example <caption>Node - (async) Delete a frontend view:</caption>
   * con.deleteFrontendView('my_view_name', function(err, viewName) {
   *   if (err) console.log(err);
   *   // viewName === 'my_view_name'
   * });
   */
  deleteFrontendView(viewName, callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the deleteFrontendView method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    // sync
    if (!callback) {
      // do we want to try each one individually so if we fail we keep going?
      this._client.forEach((client, i) => {
        client.delete_frontend_view(this._sessionId[i], viewName);
      });
      return this;
    }

    // async
    if (callback) {
      const cbNode = _cbNode.bind(this);
      this._client.forEach((client, i) => {
        client.delete_frontend_view(
          this._sessionId[i],
          viewName,
          isNode ? bindArgsFromN(cbNode, 2, i) : _cb.bind(this, i)
        );
      });
    }

    function _cb(clientIndex) {
      if (clientIndex instanceof Error) {
        callback(clientIndex);
        return;
      }
      if (clientIndex === this._client.length - 1) {
        callback(viewName);
      }
    }

    function _cbNode(error, clientIndex) {
      if (error) {
        callback(error, null);
        return;
      }
      if (clientIndex === this._client.length - 1) {
        callback(null, viewName);
      }
    }
  }

  /**
   * Create a short hash to make it easy to share a link to a specific frontend view.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, link)</code>.
   * @param {String} viewState - The base64-encoded state string of the new dashboard.
   * @param {Function} [callback] - If provided, this function will be called with the link
   *                                passed as an argument.
   * @return {String|undefined} link - A short hash of the frontend view used for URLs
   *
   * @example <caption>Browser - (sync) Create a link for the frontend view:</caption>
   * var view, link;
   * try {
   *   // get a frontend view first
   *   view = con.getFrontendView('my_frontend_view');
   *   link = con.createLink(view.view_state);
   *   // link === 'CRtzoe'
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Create a link for the frontend view:</caption>
   *  // get a frontend view first
   *  con.getFrontendView('my_frontend_view', function(view) {
   *    if(view instanceof Error) console.log(view);
   *
   *    con.createLink(view.view_state, function(link) {
   *      if(link instanceof Error) console.log(link);
   *      // link === 'CRtzoe'
   *    });
   *  });
   *
   * @example <caption>Node - (async) Create a link for the frontend view:</caption>
   *  // get a frontend view first
   *  con.getFrontendView('my_frontend_view', function(err, view) {
   *    if(err) console.log(err);
   *
   *    con.createLink(view.view_state, function(e, link) {
   *      if(e) console.log(e);
   *      // link === 'CRtzoe'
   *    });
   *  });
   */
  createLink(viewState, callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the createLink method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    // sync
    if (!callback) {
      let result = null;
      try {
        result = this._client
          .map((client, i) => {
            return client.create_link(this._sessionId[i], viewState);
          })
          .reduce((links, link) => {
            if (links.indexOf(link) === -1) {
              links.push(link);
            }
            return links;
          }, []);
        if (!result || result.length !== 1) {
          throw new Error('Different links were created on each connection');
        } else {
          return result.join();
        }
      } catch (err) {
        throw err;
      }
    }

    // async
    if (callback) {
      const cbNode = _cbNode.bind(this);
      this._client.forEach((client, i) => {
        client.create_link(
          this._sessionId[i],
          viewState,
          isNode ? bindArgsFromN(cbNode, 3, i) : bindArgsFromN(_cb.bind(this), 2, i)
        );
      });
    }

    function _cb(link, clientIndex) {
      console.log(arguments);
      if (clientIndex instanceof Error) {
        callback(clientIndex);
        return;
      }
      if (clientIndex === this._client.length - 1) {
        callback(link);
      }
    }

    function _cbNode(error, link, clientIndex) {
      if (error) {
        callback(error, null);
        return;
      }
      if (clientIndex === this._client.length - 1) {
        callback(null, link);
      }
    }
  }

  /**
   * Get a frontend view from a generated share link.
   * This object contains the given link for the <code>view_name</code> property,
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, view)</code>.
   * @param {String} link - the short hash of the dashboard, see {@link createLink}
   * @param {Function} [callback] - If provided, this function will be called with the view
   *                                passed as an argument.
   * @return {TFrontendView|undefined} view
   *
   * @example <caption>Browser - (sync) Get a frontend view from a link:</caption>
   * var view;
   * try {
   *  view = con.getLinkView('CRtzoe');
   *  // view instanceof TFrontendView === true
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Get a frontend view from a link:</caption>
   * con.getLinkView('CRtzoe', function(view) {
   *   if (view instanceof Error) console.log(view);
   *   // view instanceof TFrontendView === true
   * });
   *
   * @example <caption>Node - (async) Get a frontend view from a link:</caption>
   * con.getLinkView('CRtzoe', function(err, view) {
   *   if (err) console.log(err);
   *   // view instanceof TFrontendView === true
   * });
   */
  getLinkView(link, callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the getLinkView method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    // async
    if (callback) {
      this._client[0].get_link_view(
        this._sessionId[0],
        link,
        isNode ? _cbNode.bind(this) : _cb.bind(this)
      );
    }

    // sync
    if (!callback) {
      let result = null;
      try {
        result = this._client[0].get_link_view(this._sessionId[0], link);
      } catch (err) {
        throw err;
      }
      return result;
    }

    function _cb(view) {
      callback(view);
    }

    function _cbNode(error, view) {
      if (error) {
        callback(error, null);
        return;
      }
      callback(null, view);
    }
  }

  /**
   * Asynchronously get the data from an importable file,
   * such as a .csv or plaintext file with a header.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, tableData)</code>.
   * @param {String} fileName - the name of the importable file
   * @param {TCopyParams} copyParams - see {@link TCopyParams}
   * @param {Function} [callback] - If provided, this function will be called with the tableData
   *                                passed as an argument.
   * @return {TDetectResult} tableData
   *
   * @example <caption>Browser - (sync) Get data from table_data.csv:</caption>
   * // NOTE: Upload 'table_data.csv' to the server before running the following code:
   * var copyParams = new TCopyParams();
   * var tableData;
   * try {
   *   tableData = con.detectColumnTypes('table_data.csv', copyParams);
   *   // tableData instanceof TDetectResult === true
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Get data from table_data.csv:</caption>
   * // NOTE: Upload 'table_data.csv' to the server before running the following code:
   * var copyParams = new TCopyParams();
   * con.detectColumnTypes('table_data.csv', copyParams, function(tableData){
   *   if (tableData instanceof Error) console.log(tableData);
   *   // tableData instanceof TDetectResult === true
   * });
   *
   * @example <caption>Node - (async) Get data from table_data.csv:</caption>
   * // NOTE: Upload 'table_data.csv' to the server before running the following code:
   * var copyParams = new TCopyParams();
   * con.detectColumnTypes('table_data.csv', copyParams, function(err, tableData){
   *   if (err) console.log(err);
   *   // tableData instanceof TDetectResult === true
   * });
   */
  detectColumnTypes(fileName, copyParams, callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the detectColumnTypes method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    copyParams.delimiter = copyParams.delimiter || '';

    // async
    if (callback) {
      this._client[0].detect_column_types(
        this._sessionId[0],
        fileName,
        copyParams,
        isNode ? _cbNode.bind(this) : _cb.bind(this)
      );
    }

    // sync
    if (!callback) {
      let result = null;
      try {
        result = this._client[0].detect_column_types(this._sessionId[0], fileName, copyParams);
      } catch (err) {
        throw err;
      }
      return result;
    }


    function _cb(tableData) {
      callback(tableData);
    }

    function _cbNode(error, tableData) {
      if (error) {
        callback(error, null);
        return;
      }
      callback(null, tableData);
    }
  }

  /**
   * Submit a query to the database and process the results through an array
   * of asychronous callbacks. If no callbacks are given, use synchronous instead.
   * <br/>
   * If used in Node, you must pass an array callbacks with the following signature:
   * <code>fn(result)</code>.
   * @param {String} query - The query to perform
   * @param {Object} options - the options for the query
   * @param {Boolean} options.columnarResults=true - Indicates whether to return the data
   *                                             in columnar format. This saves time on the backend.
   * @param {Boolean} options.eliminateNullRows
   * @param {String} options.renderSpec - The backend rendering spec,
   *                                      defaults to <code>null</code> to force frontend rendering
   * @param {Array<Function>} [callbacks] - If provided, each function in this array will be called
   *                                      with the result passed as an argument.
   * @return {TQueryResult|TRenderResult|undefined} result
   *
   * @example <caption>Browser - (sync) Run a query:</caption>
   * var result;
   * try {
   *   result = con.query('SELECT count(*) AS n FROM tweets WHERE country=\'CO\'', {});
   *   // result[0].n = 5730
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Run a query:</caption>
   * con.query('SELECT count(*) AS n FROM tweets WHERE country=\'CO\'', {}, [function(result) {
   *   if (result instanceof Error) console.log(result);
   *   // result[0].n = 5730
   * }]);
   *
   * @example <caption>Node - (async) Run a query:</caption>
   * con.query('SELECT count(*) AS n FROM tweets WHERE country=\'CO\'', {}, [function(result) {
   *   if (result instanceof Error) console.log(result);
   *   // result[0].n = 5730
   * }]);
   */
  query(query, options, callbacks) {
    if (isNode && !callbacks) {
      throw new Error('You must specify a callbacks array for the query method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    let columnarResults = true;
    let eliminateNullRows = false;
    let renderSpec = null;
    let queryId = null;
    if (options) {
      columnarResults = options.hasOwnProperty('columnarResults') ?
        options.columnarResults : columnarResults;
      eliminateNullRows = options.hasOwnProperty('eliminateNullRows') ?
        options.eliminateNullRows : eliminateNullRows;
      renderSpec = options.hasOwnProperty('renderSpec') ?
        options.renderSpec : renderSpec;
      queryId = options.hasOwnProperty('queryId') ?
        options.queryId : queryId;
    }
    const processResultsQuery = renderSpec ? 'render: ' + query : query;
    const isBackendRenderingWithAsync = !!renderSpec && !!callbacks;
    const isFrontendRenderingWithAsync = !renderSpec && !!callbacks;
    const isBackendRenderingWithSync = !!renderSpec && !callbacks;
    const isFrontendRenderingWithSync = !renderSpec && !callbacks;
    // const lastQueryTime = queryId in this.queryTimes
    //   ? this.queryTimes[queryId]
    //   : this.DEFAULT_QUERY_TIME;

    const curNonce = (this._nonce++).toString();

    const conId = 0;
    // let conId = null;
    // if (this._balanceStrategy === 'adaptive') {
    //   conId = this.serverQueueTimes.indexOf(Math.min.apply(Math, this.serverQueueTimes));
    // } else {
    //   conId = curNonce % this._numConnections;
    // }
    if (!!renderSpec) {
      this._lastRenderCon = conId;
    }

    // this.serverQueueTimes[conId] += lastQueryTime;
    // console.log("Up: " + this.serverQueueTimes);

    const processResultsOptions = {
      isImage: !!renderSpec,
      eliminateNullRows,
      query: processResultsQuery,
      queryId,
      conId,
      // estimatedQueryTime: lastQueryTime,
    };

    if (isBackendRenderingWithAsync) {
      this._client[conId].render(
        this._sessionId[conId],
        query + ';',
        renderSpec,
        curNonce,
        isNode ? _cbNode.bind(this) : _cb.bind(this)
      );
    }

    if (isFrontendRenderingWithAsync) {
      this._client[conId].sql_execute(
        this._sessionId[conId],
        query + ';',
        columnarResults,
        curNonce,
        isNode ? _cbNode.bind(this) : _cb.bind(this)
      );
    }

    if (isBackendRenderingWithSync) {
      try {
        const _result = this._client[conId].render(
          this._sessionId[conId],
          query + ';',
          renderSpec,
          curNonce
        );
        return this.processResults(processResultsOptions, null, _result);
      } catch (err) {
        console.log(err);
        throw err;
      }
    }

    if (isFrontendRenderingWithSync) {
      try {
        const _result = this._client[conId].sql_execute(
          this._sessionId[conId],
          query + ';',
          columnarResults,
          curNonce
        );
        return this.processResults(processResultsOptions, null, _result); // null is callbacks slot
      } catch (err) {
        console.log(err);
        throw err;
      }
    }

    function _cbNode(error, result) {
      if (error) {
        this.processResults(processResultsOptions, callbacks, error);
        return;
      }
      this.processResults(processResultsOptions, callbacks, result);
    }

    function _cb(result) {
      if (result instanceof Error) {
        this.processResults(processResultsOptions, callbacks, error);
        return;
      }
      this.processResults(processResultsOptions, callbacks, result);
    }
  }

  /**
   * TODO
   */
  removeConnection(conId) {
    if (conId < 0 || conId >= this.numConnections) {
      const err = {
        msg: 'Remove connection id invalid',
      };
      throw err;
    }
    this._client.splice(conId, 1);
    this._sessionId.splice(conId, 1);
    this._numConnections--;
  }


  /**
   * Because it is inefficient for the server to return a row-based
   * data structure, it is better to process the column-based results into a row-based
   * format after the fact.
   *
   * @param {TRowSet} data - The column-based data returned from a query
   * @param {Boolean} eliminateNullRows
   * @returns {Object} processedResults
   */
  processColumnarResults(data, eliminateNullRows) {
    const formattedResult = { fields: [], results: [] };
    const numCols = data.row_desc.length;
    const numRows = data.columns[0] !== undefined ? data.columns[0].nulls.length : 0;

    formattedResult.fields = data.row_desc.map((field) => {
      return {
        name: field.col_name,
        type: this._datumEnum[field.col_type.type],
        is_array: field.col_type.is_array,
      };
    });

    for (let r = 0; r < numRows; r++) {
      if (eliminateNullRows) {
        let rowHasNull = false;
        for (let c = 0; c < numCols; c++) {
          if (data.columns[c].nulls[r]) {
            rowHasNull = true;
            break;
          }
        }
        if (rowHasNull) {
          continue;
        }
      }
      const row = {};
      for (let c = 0; c < numCols; c++) {
        const fieldName = formattedResult.fields[c].name;
        const fieldType = formattedResult.fields[c].type;
        const fieldIsArray = formattedResult.fields[c].is_array;
        const isNull = data.columns[c].nulls[r];
        if (isNull) {
          // row[fieldName] = "NULL";
          row[fieldName] = null;
          continue;
        }
        if (fieldIsArray) {
          row[fieldName] = [];
          const arrayNumElems = data.columns[c].data.arr_col[r].nulls.length;
          for (let e = 0; e < arrayNumElems; e++) {
            if (data.columns[c].data.arr_col[r].nulls[e]) {
              row[fieldName].push('NULL');
              continue;
            }
            switch (fieldType) {
              case 'BOOL':
                row[fieldName].push(data.columns[c].data.arr_col[r].data.int_col[e] ? true : false);
                break;
              case 'SMALLINT':
              case 'INT':
              case 'BIGINT':
                row[fieldName].push(data.columns[c].data.arr_col[r].data.int_col[e]);
                break;
              case 'FLOAT':
              case 'DOUBLE':
              case 'DECIMAL':
                row[fieldName].push(data.columns[c].data.arr_col[r].data.real_col[e]);
                break;
              case 'STR':
                row[fieldName].push(data.columns[c].data.arr_col[r].data.str_col[e]);
                break;
              case 'TIME':
              case 'TIMESTAMP':
              case 'DATE':
                row[fieldName].push(data.columns[c].data.arr_col[r].data.int_col[e] * 1000);
                break;
              default:
                break;
            }
          }
        } else {
          switch (fieldType) {
            case 'BOOL':
              row[fieldName] = data.columns[c].data.int_col[r] ? true : false;
              break;
            case 'SMALLINT':
            case 'INT':
            case 'BIGINT':
              row[fieldName] = data.columns[c].data.int_col[r];
              break;
            case 'FLOAT':
            case 'DOUBLE':
            case 'DECIMAL':
              row[fieldName] = data.columns[c].data.real_col[r];
              break;
            case 'STR':
              row[fieldName] = data.columns[c].data.str_col[r];
              break;
            case 'TIME':
            case 'TIMESTAMP':
            case 'DATE':
              row[fieldName] = new Date(data.columns[c].data.int_col[r] * 1000);
              break;
            default:
              break;
          }
        }
      }
      formattedResult.results.push(row);
    }
    return formattedResult;
  }

  /**
   * It should be avoided to query for row-based results from the server, howerver
   * it can still be done. In this case, still process them into the same format as
   * (@link processColumnarResults} to keep the output consistent.
   * @param {TRowSet} data - The row-based data returned from a query
   * @param {Boolean} eliminateNullRows
   * @returns {Object} processedResults
   */
  processRowResults(data, eliminateNullRows) {
    const numCols = data.row_desc.length;
    const formattedResult = { fields: [], results: [] };

    formattedResult.fields = data.row_desc.map((field) => {
      return {
        name: field.col_name,
        type: this._datumEnum[field.col_type.type],
        is_array: field.col_type.is_array,
      };
    });

    formattedResult.results = [];
    let numRows = 0;
    if (data.rows !== undefined && data.rows !== null) {
      numRows = data.rows.length; // so won't throw if data.rows is missing
    }

    for (let r = 0; r < numRows; r++) {
      if (eliminateNullRows) {
        let rowHasNull = false;
        for (let c = 0; c < numCols; c++) {
          if (data.rows[r].columns[c].is_null) {
            rowHasNull = true;
            break;
          }
        }
        if (rowHasNull) {
          continue;
        }
      }

      const row = {};
      for (let c = 0; c < numCols; c++) {
        const fieldName = formattedResult.fields[c].name;
        const fieldType = formattedResult.fields[c].type;
        const fieldIsArray = formattedResult.fields[c].is_array;
        if (fieldIsArray) {
          if (data.rows[r].cols[c].is_null) {
            row[fieldName] = 'NULL';
            continue;
          }
          row[fieldName] = [];
          const arrayNumElems = data.rows[r].cols[c].val.arr_val.length;
          for (let e = 0; e < arrayNumElems; e++) {
            const elemDatum = data.rows[r].cols[c].val.arr_val[e];
            if (elemDatum.is_null) {
              row[fieldName].push('NULL');
              continue;
            }
            switch (fieldType) {
              case 'BOOL':
                row[fieldName].push(elemDatum.val.int_val ? true : false);
                break;
              case 'SMALLINT':
              case 'INT':
              case 'BIGINT':
                row[fieldName].push(elemDatum.val.int_val);
                break;
              case 'FLOAT':
              case 'DOUBLE':
              case 'DECIMAL':
                row[fieldName].push(elemDatum.val.real_val);
                break;
              case 'STR':
                row[fieldName].push(elemDatum.val.str_val);
                break;
              case 'TIME':
              case 'TIMESTAMP':
              case 'DATE':
                row[fieldName].push(elemDatum.val.int_val * 1000);
                break;
              default:
                break;
            }
          }
        } else {
          const scalarDatum = data.rows[r].cols[c];
          if (scalarDatum.is_null) {
            row[fieldName] = 'NULL';
            continue;
          }
          switch (fieldType) {
            case 'BOOL':
              row[fieldName] = scalarDatum.val.int_val ? true : false;
              break;
            case 'SMALLINT':
            case 'INT':
            case 'BIGINT':
              row[fieldName] = scalarDatum.val.int_val;
              break;
            case 'FLOAT':
            case 'DOUBLE':
            case 'DECIMAL':
              row[fieldName] = scalarDatum.val.real_val;
              break;
            case 'STR':
              row[fieldName] = scalarDatum.val.str_val;
              break;
            case 'TIME':
            case 'TIMESTAMP':
            case 'DATE':
              row[fieldName] = new Date(scalarDatum.val.int_val * 1000);
              break;
            default:
              break;
          }
        }
      }
      formattedResult.results.push(row);
    }
    return formattedResult;
  }

  /**
   * Decides how to process raw results once they come back from the server.
   *
   * @param {Object} options
   * @param {Boolean} options.isImage - Set to true when querying for backend rendered images
   * @param {Boolean} options.eliminateNullRows
   * @param {String} options.query - The SQL query string used only for logging
   * @param {Number} options.queryId
   * @param {Number} options.conId
   * @param {String} options.estimatedQueryTime
   * @param {Array<Function>} callbacks
   * @param {Object} result - The query result used to decide whether to process
   *                          as column or row results.
   * @return {Object} null if image with callbacks, result if image with callbacks,
   *                  otherwise formatted results
   */
  processResults(options, callbacks, result) {
    let isImage = false;
    let eliminateNullRows = false;
    let query = null;
    let queryId = null;
    let conId = null;
    let estimatedQueryTime = null;
    const hasCallback = !!callbacks;

    if (typeof options !== 'undefined') {
      isImage = options.isImage ? options.isImage : false;
      eliminateNullRows = options.eliminateNullRows ? options.eliminateNullRows : false;
      query = options.query ? options.query : null;
      queryId = options.queryId ? options.queryId : null;
      conId = typeof options.conId !== 'undefined' ? options.conId : null;
      estimatedQueryTime = typeof options.estimatedQueryTime !== 'undefined'
        ? options.estimatedQueryTime
        : null;
    }
    if (result.execution_time_ms && conId !== null && estimatedQueryTime !== null) {
      this.serverQueueTimes[conId] -= estimatedQueryTime;
      // console.log("Down: " + this.serverQueueTimes);
      this.queryTimes[queryId] = result.execution_time_ms;
    }

    if (this._logging && result.execution_time_ms) {
      console.log(
        query,
        'on Server',
        conId,
        '- Execution Time:',
        result.execution_time_ms,
        ' ms, Total Time:',
        result.total_time_ms + 'ms'
      );
    }

    if (isImage && hasCallback) {
      callbacks.pop()(result, callbacks);
    } else if (isImage && !hasCallback) {
      return result;
    } else if (result instanceof Error) {
      callbacks.pop()(result, callbacks);
      return; // eslint-disable-line consistent-return
    } else {
      result = result.row_set;
      let formattedResult = null;
      if (result.is_columnar) {
        formattedResult = this.processColumnarResults(result, eliminateNullRows);
      } else {
        formattedResult = this.processRowResults(result, eliminateNullRows);
      }
      if (hasCallback) {
        callbacks.pop()(formattedResult.results, callbacks);
      } else {
        return formattedResult.results;
      }
    }
  }

  /**
   * Get the names of the databases that exist on the current session's connectdion.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, databases)</code>.
   * @param {Function} [callback] - If provided, this function will be called with the databases
   *                                passed as an argument.
   * @return {Array<String>|undefined} databases
   *
   * @example <caption>Browser - (sync) Get the list of databases:</caption>
   * var databases;
   * try {
   *   databases = con.getDatabases();
   *   // databases === ['database_name1', 'database_name2', ...]
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Get the list of databases:</caption>
   * con.getDatabases(function(databases) {
   *   if (databases instanceof Error) console.log(databases);
   *   // databases === ['database_name1', 'database_name2', ...]
   * });
   *
   * @example <caption>Node - (async) Get the list of databases:</caption>
   * con.getDatabases(function(err, databases) {
   *   if (err) console.log(err);
   *   // databases === ['database_name1', 'database_name2', ...]
   * });
   */
  getDatabases(callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the getDatabases method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    // async
    if (callback) {
      this._client[0].get_databases(
        isNode ? _cbNode.bind(this) : _cb.bind(this)
      );
    }

    // sync
    if (!callback) {
      let databases = null;
      try {
        databases = this._client[0].get_databases();
        return databases.map((db) => { return db.db_name; });
      } catch (err) {
        throw err;
      }
    }

    function _cb(databases) {
      callback(databases);
    }

    function _cbNode(error, databases) {
      if (error) {
        callback(error, null);
        return;
      }
      callback(null, databases);
    }
  }

  /**
   * Get the names of the tables that exist on the current session's connectdion.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, tables)</code>.
   * @param {Function} [callback] - If provided, this function will be called with the tables
   *                                passed as an argument.
   * @return {Array<Object>|undefined} tables
   *
   * @example <caption>Browser - (sync) Get the list of tables from a connection:</caption>
   * var tables;
   * try {
   *   tables = con.getTables();
   *   // tables === [{ label: 'obs', name: 'tableName' }, ...]
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Get the list of tables from a connection:</caption>
   * con.getTables(function(tables) {
   *   if (tables instanceof Error) console.log(tables);
   *   // tables === [{ label: 'obs', name: 'tableName' }, ...]
   * });
   *
   * @example <caption>Node - (async) Get the list of tables from a connection:</caption>
   * con.getTables(function(err, tables) {
   *   if (err) console.log(err);
   *   // tables === [{ label: 'obs', name: 'tableName' }, ...]
   * });
   */
  getTables(callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the getTables method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    // async
    if (callback) {
      this._client[0].get_tables(
        this._sessionId[0],
        isNode ? _cbNode.bind(this) : _cb.bind(this)
      );
    }

    // sync
    if (!callback) {
      let tabs = null;
      try {
        tabs = this._client[0].get_tables(this._sessionId[0]);
      } catch (err) {
        throw err;
      }
      return _formatResult(tabs);
    }

    function _cb(tables) {
      callback(_formatResult(tables));
    }

    function _cbNode(error, tables) {
      if (error) {
        callback(error, null);
        return;
      }
      callback(null, _formatResult(tables));
    }

    function _formatResult(tables) {
      return tables.map((table) => {
        return {
          name: table,
          label: 'obs',
        };
      });
    }
  }

  /**
   * Create an array-like object from {@link TDatumType} by
   * flipping the string key and numerical value around.
   */
  invertDatumTypes() {
    const _datumTypes = isNode ? TDatumType : window.TDatumType;
    Object.keys(_datumTypes).forEach((key) => {
      if (_datumTypes.hasOwnProperty(key)) {
        this._datumEnum[_datumTypes[key]] = key;
      }
    });
  }

  /**
   * Get a list of field objects for a given table.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, fields)</code>.
   * @param {String} tableName - name of table containing field names
   * @param {Function} [callback] - If provided, this function will be called with the fields
   *                                passed as an argument.
   * @return {Array<Object>|undefined} fields
   *
   * @example <caption>Browser - (sync) Get the list of fields from a specific table:</caption>
   * var fields;
   * try {
   *   fields = con.getFields('my_table_name');
   *   // fields === [
   *        {
   *          name: 'fieldName',
   *          type: 'BIGINT',
   *          is_array: false,
   *          is_dict: false
   *        },
   *        ...
   *      ]
   *   } catch (e) {
   *     console.log(e);
   *   }
   *
   * @example <caption>Browser - (async) Get the list of fields from a specific table:</caption>
   * con.getFields('my_table_name', function(fields) {
   *   if (fields instanceof Error) console.log(fields);
   *   // fields === [
   *        {
   *          name: 'fieldName',
   *          type: 'BIGINT',
   *          is_array: false,
   *          is_dict: false
   *        },
   *        ...
   *      ]
   * };
   *
   * @example <caption>Node - (async) Get the list of fields from a specific table:</caption>
   * con.getFields('my_table_name', function(err, fields) {
   *   if (err) console.log(err);
   *   // fields === [
   *        {
   *          name: 'fieldName',
   *          type: 'BIGINT',
   *          is_array: false,
   *          is_dict: false
   *        },
   *        ...
   *      ]
   * };
   *
   */
  getFields(tableName, callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the getFields method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    // async
    if (callback) {
      this._client[0].get_table_descriptor(
        this._sessionId[0],
        tableName,
        isNode ? _cbNode.bind(this) : _cb.bind(this)
      );
    }

    // sync
    if (!callback) {
      let fields = null;
      try {
        fields = this._client[0].get_table_descriptor(this._sessionId[0], tableName);
      } catch (err) {
        throw new Error('Table (' + tableName + ') not found');
      }
      return _formatResult.call(this, fields);
    }

    function _cb(fields) {
      callback(_formatResult.call(this, fields));
    }

    function _cbNode(error, fields) {
      if (error) {
        callback(error, null);
        return;
      }
      callback(null, _formatResult.call(this, fields));
    }

    function _formatResult(fields) {
      return Object.keys(fields).map((key) => {
        return {
          name: key,
          type: this._datumEnum[fields[key].col_type.type],
          is_array: fields[key].col_type.is_array,
          is_dict: fields[key].col_type.encoding === TEncodingType.DICT,
        };
      });
    }
  }

  /**
   * Create a table and persist it to the backend.
   * @param {String} tableName - desired name of the new table
   * @param {Array<TColumnType>} rowDesc - fields of the new table
   * @param {Function} [callback] - If provided, this function will be called with the tableName
   *                                passed as an argument.
   * @return {String|undefined} tableName
   *
   * @example <caption>Browser - (sync) Create a new table:</caption>
   * var table;
   * try {
   *   table = con.createTable('my_new_table', [TColumnType, TColumnType, ...]);
   *   // table === 'my_new_table'
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Create a new table:</caption>
   * con.createTable('my_new_table', [TColumnType, TColumnType, ...], function(tableName) {
   *   if (tableName instanceof Error) console.log(tableName);
   *   // tableName === 'my_new_table'
   * });
   *
   * @example <caption>Node - (async) Create a new table:</caption>
   * con.createTable('my_new_table', [TColumnType, TColumnType, ...], function(err, tableName) {
   *   if (err) console.log(err);
   *   // tableName === 'my_new_table'
   * });
   */
  createTable(tableName, rowDesc, callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the createTable method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    // async
    if (callback) {
      const cbNode = _cbNode.bind(this);
      this._client.forEach((client, i) => {
        client.create_table(
          this._sessionId[i],
          tableName,
          rowDesc,
          isNode ? bindArgsFromN(cbNode, 2, i) : _cb.bind(this, i)
        );
      });
    }

    // sync
    if (!callback) {
      this._client.forEach((client, i) => {
        client.create_table(this._sessionId[i], tableName, rowDesc);
      });
      return tableName;
    }

    function _cb(clientIndex) {
      if (clientIndex instanceof Error) {
        callback(clientIndex);
        return;
      }
      if (clientIndex === this._client.length - 1) {
        callback(tableName);
      }
    }

    function _cbNode(error, clientIndex) {
      if (error) {
        callback(error, null);
        return;
      }
      if (clientIndex === this._client.length - 1) {
        callback(null, tableName);
      }
    }
  }

  /**
   * Import a table from a file.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, tableName)</code>.
   * @param {String} tableName - desired name of the new table
   * @param {String} fileName - the file on the server to import
   * @param {TCopyParams} copyParams - see {@link TCopyParams}
   * @param {Function} [callback] - If provided, this function will be called with the tableName
   *                                passed as an argument.
   * @return {String|undefined} tableName
   *
   * @example <caption>Browser - (sync) Import a table:</caption>
   * var copyParams = new TCopyParams();
   * copyParams.delimiter = ',';
   * copyParams.quoted = false;
   * copyParams.null_str = 'null';
   *
   * var tableName;
   * try {
   *   // NOTE: Upload 'table_data.csv' to the server before running the following code:
   *   tableName = con.importTable('my_table_name', 'table_data.csv', copyParams);
   *   // tableName === 'my_table_name'
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Import a table:</caption>
   * var copyParams = new TCopyParams();
   * copyParams.delimiter = ',';
   * copyParams.quoted = false;
   * copyParams.null_str = 'null';
   *
   * // NOTE: Upload 'table_data.csv' to the server before running the following code:
   * con.importTable('my_table_name', 'table_data.csv', copyParams, function(tableName){
   *   if (tableName instanceof Error) console.log(tableName);
   *   // tableName === 'my_table_name'
   * });
   *
   * @example <caption>Node - (async) Import a table:</caption>
   * var copyParams = new TCopyParams();
   * copyParams.delimiter = ',';
   * copyParams.quoted = false;
   * copyParams.null_str = 'null';
   *
   * // NOTE: Upload 'table_data.csv' to the server before running the following code:
   * con.importTable('my_table_name', 'table_data.csv', copyParams, function(err, tableName){
   *   if (err) console.log(err);
   *   // tableName === 'my_table_name'
   * });
   */
  importTable(tableName, fileName, copyParams, callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the importTable method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    copyParams.delimiter = copyParams.delimiter || '';

    // async
    if (callback) {
      const cbNode = _cbNode.bind(this);
      this._client.forEach((client, i) => {
        client.import_table(
          this._sessionId[i],
          tableName,
          fileName,
          copyParams,
          isNode ? bindArgsFromN(cbNode, 2, i) : _cb.bind(this, i)
        );
      });
    }

    // sync
    if (!callback) {
      this._client.forEach((client, i) => {
        client.import_table(
          this._sessionId[i],
          tableName,
          fileName,
          copyParams
        );
      });
      return tableName;
    }

    function _cb(clientIndex) {
      if (clientIndex instanceof Error) {
        callback(clientIndex);
        return;
      }
      if (clientIndex === this._client.length - 1) {
        callback(tableName);
      }
    }

    function _cbNode(error, clientIndex) {
      if (error) {
        callback(error, null);
        return;
      }
      if (clientIndex === this._client.length - 1) {
        callback(null, tableName);
      }
    }
  }

  /**
   * Get the status of the table import operation.
   * <br/>
   * If used in Node, you must pass a callback with the following signature:
   * <code>fn(err, importStatus)</code>.
   * @param {TCopyParams} importId - the file being imported
   * @param {Function} [callback] - If provided, this function will be called with the importStatus
   *                                passed as an argument.
   * @return {TImportStatus|undefined} - importStatus
   *
   * @example <caption>Browser - (sync) Get the import status:</caption>
   * var importStatus;
   * try {
   *   importStatus = con.importTableStatus('table_data.csv');
   * } catch (e) {
   *   console.log(e);
   * }
   *
   * @example <caption>Browser - (async) Get the import status:</caption>
   * con.importTableStatus('table_data.csv', function(importStatus) {
   *   if (importStatus instanceof Error) console.log(e);
   *   // importStatus instanceof TImportStatus === true
   * });
   *
   * @example <caption>Node - (async) Get the import status:</caption>
   * con.importTableStatus('table_data.csv', function(err, importStatus) {
   *   if (err) console.log(err);
   *   // importStatus instanceof TImportStatus === true
   * });
   */
  importTableStatus(importId, callback) {
    if (isNode && !callback) {
      throw new Error('You must specify a callback for the importTableStatus method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    // sync
    if (!callback) {
      return this._client[0].import_table_status(this._sessionId[0], importId);
    }

    // async
    if (callback) {
      this._client[0].import_table_status(
        this._sessionId[0],
        importId,
        isNode ? _cbNode.bind(this) : _cb.bind(this)
      );
    }

    function _cb(importStatus) {
      callback(importStatus);
    }

    function _cbNode(error, importStatus) {
      if (error) {
        callback(error, null);
        return;
      }
      callback(null, importStatus);
    }
  }

  /**
   * Used primarily for backend rendered maps, this method will fetch the rows
   * that correspond to longitude/latitude points.
   *
   * @param {Array<TPixel>} pixels
   * @param {String} tableName - the table containing the geo data
   * @param {Array<String>} colNames - the fields to fetch
   * @param {Array<Function>} callbacks
   */
  getRowsForPixels(pixels, tableName, colNames, callbacks) {
    if (isNode && !callbacks) {
      throw new Error('You must specify callbacks for the getRowsForPixels method.');
    }

    if (!this._sessionId) {
      throw new Error('You are not connected to a server. Try running the connect method first.');
    }

    // async
    const widgetId = 1;  // INT
    const columnFormat = true; // BOOL
    const curNonce = (this._nonce++).toString();
    try {
      if (!callbacks) {
        return this.processPixelResults(
          undefined,
          this._client[this._lastRenderCon].get_rows_for_pixels(
            this._sessionId[this._lastRenderCon],
            widgetId,
            pixels,
            tableName,
            colNames,
            columnFormat,
            curNonce
          ));
      }
      this._client[this._lastRenderCon].get_rows_for_pixels(
        this._sessionId[this._lastRenderCon],
        widgetId,
        pixels,
        tableName,
        colNames,
        columnFormat,
        curNonce,
        this.processPixelResults.bind(this, callbacks)
      );
    } catch (err) {
      throw err;
    }
    return curNonce;
  }

  /**
   * Formats the pixel results into the same pattern as textual results.
   *
   * @param {Array<Function>} callbacks
   * @param {Object} results
   */
  processPixelResults(callbacks, results) {
    results = results.pixel_rows;
    const numPixels = results.length;
    const processResultsOptions = {
      isImage: false,
      eliminateNullRows: false,
      query: 'pixel request',
      queryId: -2,
    };
    for (let p = 0; p < numPixels; p++) {
      results[p].row_set = this.processResults(processResultsOptions, null, results[p]);
    }
    if (!callbacks) {
      return results;
    }
    callbacks.pop()(results, callbacks);
  }

  /**
   * TODO: Returns an empty String.
   */
  getUploadServer() {
    return '';
  }

  /**
   * Get or set the session ID used by the server to serve the correct data.
   * This is typically set by {@link connect} and should not be set manually.
   * @param {Number} [sessionId] - The session ID of the current connection
   * @return {Number|MapdCon} - The session ID or the MapdCon itself
   *
   * @example <caption>Get the session id:</caption>
   * var sessionID = new MapdCon()
   *   .host('localhost')
   *   .port('8080')
   *   .dbName('myDatabase')
   *   .user('foo')
   *   .password('bar')
   *   .connect()
   *   .sessionId();
   * // sessionID === 3145846410
   *
   * @example <caption>Set the session id:</caption>
   * var con = new MapdCon().connect().sessionId(3415846410);
   * // NOTE: It is generally unsafe to set the session id manually.
   */
  sessionId(sessionId) {
    if (!arguments.length) {
      return this._sessionId;
    }
    this._sessionId = sessionId;
    return this;
  }

  /**
   * Get or set the connection server hostname.
   * This is is typically the first method called after instantiating a new MapdCon.
   * @param {String} [host] - The hostname address
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
      return this._host;
    } else if (!Array.isArray(host)) {
      this._host = [host];
    } else {
      this._host = host;
    }
    return this;
  }

  /**
   * Get or set the connection port.
   * @param {String} [port] - The port to connect on
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
      return this._port;
    } else if (!Array.isArray(port)) {
      this._port = [port];
    } else {
      this._port = port;
    }
    return this;
  }

  /**
   * Get or set the username to authenticate with.
   * @param {String} [user] - The username to authenticate with
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
      return this._user;
    } else if (!Array.isArray(user)) {
      this._user = [user];
    } else {
      this._user = user;
    }
    return this;
  }

  /**
   * Get or set the user's password to authenticate with.
   * @param {String} [password] - The password to authenticate with
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
      return this._password;
    } else if (!Array.isArray(password)) {
      this._password = [password];
    } else {
      this._password = password;
    }
    return this;
  }

  /**
   * Get or set the name of the database to connect to.
   * @param {String} [dbName] - The database to connect to
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
      return this._dbName;
    } else if (!Array.isArray(dbName)) {
      this._dbName = [dbName];
    } else {
      this._dbName = dbName;
    }
    return this;
  }

  /**
   * Whether the raw queries strings will be logged to the console.
   * Used primarily for debugging and defaults to <code>false</code>.
   * @param {Boolean} [logging] - Set to true to enable logging
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
    if (!arguments.length) {
      return this._logging;
    }
    this._logging = logging;
    return this;
  }

  /**
   * The name of the platform.
   * @param {String} [platform] - The platform, default is "mapd"
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
      return this._platform;
    }
    this._platform = platform;
    return this;
  }

  /**
   * Get the number of connections that are currently open.
   * @return {Number} - number of open connections
   *
   * @example <caption>Get the number of connections:</caption>
   * var con = new MapdCon()
   *   .host('localhost')
   *   .port('8080')
   *   .dbName('myDatabase')
   *   .user('foo')
   *   .password('bar')
   *   .connect();
   *
   * var numConnections = con.numConnections();
   * // numConnections === 1
   */
  numConnections() {
    return this._numConnections;
  }

  /**
   * The MapDClient instance to perform queries with.
   * @param {MapDClient} [client] - Thrift object used for communicating with the server
   * @return {MapDClient|MapdCon} - MapDClient or MapdCon itself
   *
   * @example <caption>Set the client:</caption>
   * var con = new MapdCon().client(client);
   * // NOTE: It is generally unsafe to set the client manually. Use connect() instead.
   *
   * @example <caption>Get the client:</caption>
   * var client = con.client();
   * // client instanceof MapDClient === true
   */
  client(client) {
    if (!arguments.length) {
      return this._client;
    }
    this._client = client;
    return this;
  }

  /**
   * The protocol to use for requests.
   * @param {String} [protocol] - http or https
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
      return this._protocol;
    } else if (!Array.isArray(protocol)) {
      this._protocol = [protocol];
    } else {
      this._protocol = protocol;
    }
    return this;
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
    return this._host.map((host, i) => {
      return this._protocol[i] + '://' + host + ':' + this._port[i];
    });
  }
}

// Set window#MadCon for browser environments
if (typeof module !== 'undefined' && module.exports && typeof window !== 'undefined') {
  window.MapdCon = MapdCon;
}
