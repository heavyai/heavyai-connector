/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global Thrift*/

	var _helpers = __webpack_require__(3);

	var helpers = _interopRequireWildcard(_helpers);

	var _mapdClientV = __webpack_require__(4);

	var _mapdClientV2 = _interopRequireDefault(_mapdClientV);

	var _processQueryResults = __webpack_require__(6);

	var _processQueryResults2 = _interopRequireDefault(_processQueryResults);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var COMPRESSION_LEVEL_DEFAULT = 3;

	function arrayify(maybeArray) {
	  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
	}

	/**
	 * The MapdCon class provides the necessary methods for performing queries to a
	 * MapD GPU database. In order to use MapdCon, you must have the Thrift library
	 * loaded into the <code>window</code> object first.
	 */

	var MapdCon = function () {

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
	  function MapdCon() {
	    var _this = this;

	    _classCallCheck(this, MapdCon);

	    this.updateQueryTimes = function (conId, queryId, estimatedQueryTime, execution_time_ms) {
	      _this.queryTimes[queryId] = execution_time_ms;
	    };

	    this.getFrontendViews = function (callback) {
	      if (_this._sessionId) {
	        _this._client[0].get_frontend_views(_this._sessionId[0], function (error, views) {
	          if (error) {
	            callback(error);
	          } else {
	            callback(null, views);
	          }
	        });
	      } else {
	        callback(new Error("No Session ID"));
	      }
	    };

	    this.getFrontendViewsAsync = function () {
	      return new Promise(function (resolve, reject) {
	        _this.getFrontendViews(function (error, views) {
	          if (error) {
	            reject(error);
	          } else {
	            resolve(views);
	          }
	        });
	      });
	    };

	    this.getFrontendView = function (viewName, callback) {
	      if (_this._sessionId && viewName) {
	        _this._client[0].get_frontend_view(_this._sessionId[0], viewName, function (error, view) {
	          if (error) {
	            callback(error);
	          } else {
	            callback(null, view);
	          }
	        });
	      } else {
	        callback(new Error("No Session ID"));
	      }
	    };

	    this.getFrontendViewAsync = function (viewName) {
	      return new Promise(function (resolve, reject) {
	        _this.getFrontendView(viewName, function (err, view) {
	          if (err) {
	            reject(err);
	          } else {
	            resolve(view);
	          }
	        });
	      });
	    };

	    this.getServerStatus = function (callback) {
	      _this._client[0].get_server_status(_this._sessionId[0], function (result) {
	        if ((typeof result === "undefined" ? "undefined" : _typeof(result)) === "object" && result.hasOwnProperty("read_only") && result.hasOwnProperty("rendering_enabled") && result.hasOwnProperty("version")) {
	          callback(null, result);
	        } else {
	          callback(result, null);
	        }
	      });
	    };

	    this.getServerStatusAsync = function () {
	      return new Promise(function (resolve, reject) {
	        _this.getServerStatus(function (err, result) {
	          if (err) {
	            reject(err);
	          } else {
	            resolve(result);
	          }
	        });
	      });
	    };

	    this.createFrontendViewAsync = function (viewName, viewState, imageHash, metaData) {
	      if (!_this._sessionId) {
	        return new Promise(function (resolve, reject) {
	          reject(new Error("You are not connected to a server. Try running the connect method first."));
	        });
	      }

	      return Promise.all(_this._client.map(function (client, i) {
	        return new Promise(function (resolve, reject) {
	          client.create_frontend_view(_this._sessionId[i], viewName, viewState, imageHash, metaData, function (error, data) {
	            if (error) {
	              reject(error);
	            } else {
	              resolve(data);
	            }
	          });
	        });
	      }));
	    };

	    this.deleteFrontendView = function (viewName, callback) {
	      if (!_this._sessionId) {
	        throw new Error("You are not connected to a server. Try running the connect method first.");
	      }
	      try {
	        _this._client.forEach(function (client, i) {
	          // do we want to try each one individually so if we fail we keep going?
	          client.delete_frontend_view(_this._sessionId[i], viewName, callback);
	        });
	      } catch (err) {
	        console.log("ERROR: Could not delete the frontend view. Check your session id.", err);
	      }
	    };

	    this.deleteFrontendViewAsync = function (viewName) {
	      return new Promise(function (resolve, reject) {
	        _this.deleteFrontendView(viewName, function (err) {
	          if (err) {
	            reject(err);
	          } else {
	            resolve(viewName);
	          }
	        });
	      });
	    };

	    this.getLinkView = function (link, callback) {
	      _this._client[0].get_link_view(_this._sessionId[0], link, function (theLink) {
	        callback(null, theLink);
	      });
	    };

	    this.getLinkViewAsync = function (link) {
	      return new Promise(function (resolve, reject) {
	        _this.getLinkView(link, function (err, theLink) {
	          if (err) {
	            reject(err);
	          } else {
	            resolve(theLink);
	          }
	        });
	      });
	    };

	    this.createTableAsync = function (tableName, rowDescObj, tableType) {
	      return new Promise(function (resolve, reject) {
	        _this.createTable(tableName, rowDescObj, tableType, function (err) {
	          if (err) {
	            reject(err);
	          } else {
	            resolve();
	          }
	        });
	      });
	    };

	    this.importTableAsync = this.importTableAsyncWrapper(false);
	    this.importTableGeoAsync = this.importTableAsyncWrapper(true);

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
	    this._platform = "mapd";
	    this._nonce = 0;
	    this._balanceStrategy = "adaptive";
	    this._numConnections = 0;
	    this._lastRenderCon = 0;
	    this.queryTimes = {};
	    this.serverQueueTimes = null;
	    this.serverPingTimes = null;
	    this.pingCount = null;
	    this.DEFAULT_QUERY_TIME = 50;
	    this.NUM_PINGS_PER_SERVER = 4;
	    this.importerRowDesc = null;

	    // invoke initialization methods
	    this.invertDatumTypes();

	    /** Deprecated */
	    this.queryAsync = this.query;

	    this.processResults = function () {
	      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      var result = arguments[1];
	      var callback = arguments[2];

	      var processor = (0, _processQueryResults2.default)(_this._logging, _this.updateQueryTimes);
	      var processResultsObject = processor(options, _this._datumEnum, result, callback);
	      return processResultsObject;
	    };

	    // return this to allow chaining off of instantiation
	    return this;
	  }

	  /**
	   * Create a connection to the server, generating a client and session id.
	   * @return {MapdCon} Object
	   *
	   * @example <caption>Connect to a MapD server:</caption>
	   * var con = new MapdCon()
	   *   .host('localhost')
	   *   .port('8080')
	   *   .dbName('myDatabase')
	   *   .user('foo')
	   *   .password('bar')
	   *   .connect();
	   * // con.client() instanceof MapDClient === true
	   * // con.sessionId() === 2070686863
	   */


	  _createClass(MapdCon, [{
	    key: "connect",
	    value: function connect(callback) {
	      var _this2 = this;

	      if (this._sessionId) {
	        this.disconnect();
	      }

	      // TODO: should be its own function
	      var allAreArrays = Array.isArray(this._host) && Array.isArray(this._port) && Array.isArray(this._user) && Array.isArray(this._password) && Array.isArray(this._dbName);
	      if (!allAreArrays) {
	        return callback("All connection parameters must be arrays.");
	      }

	      this._client = [];
	      this._sessionId = [];

	      if (!this._user[0]) {
	        return callback("Please enter a username.");
	      } else if (!this._password[0]) {
	        return callback("Please enter a password.");
	      } else if (!this._dbName[0]) {
	        return callback("Please enter a database.");
	      } else if (!this._host[0]) {
	        return callback("Please enter a host name.");
	      } else if (!this._port[0]) {
	        return callback("Please enter a port.");
	      }

	      // now check to see if length of all arrays are the same and > 0
	      var hostLength = this._host.length;
	      if (hostLength < 1) {
	        return callback("Must have at least one server to connect to.");
	      }
	      if (hostLength !== this._port.length || hostLength !== this._user.length || hostLength !== this._password.length || hostLength !== this._dbName.length) {
	        return callback("Array connection parameters must be of equal length.");
	      }

	      if (!this._protocol) {
	        this._protocol = this._host.map(function () {
	          return window.location.protocol.replace(":", "");
	        });
	      }

	      var transportUrls = this.getEndpoints();

	      var _loop = function _loop(h) {
	        var transport = new Thrift.Transport(transportUrls[h]);
	        var protocol = new Thrift.Protocol(transport);
	        var client = new _mapdClientV2.default(protocol);
	        client.connect(_this2._user[h], _this2._password[h], _this2._dbName[h], function (error, sessionId) {
	          if (error) {
	            callback(error);
	            return;
	          }
	          _this2._client.push(client);
	          _this2._sessionId.push(sessionId);
	          _this2._numConnections = _this2._client.length;
	          callback(null, _this2);
	        });
	      };

	      for (var h = 0; h < hostLength; h++) {
	        _loop(h);
	      }

	      return this;
	    }
	  }, {
	    key: "convertFromThriftTypes",
	    value: function convertFromThriftTypes(fields) {
	      var fieldsArray = [];
	      // silly to change this from map to array
	      // - then later it turns back to map
	      for (var key in fields) {
	        if (fields.hasOwnProperty(key)) {
	          fieldsArray.push({
	            name: key,
	            type: this._datumEnum[fields[key].col_type.type],
	            is_array: fields[key].col_type.is_array,
	            is_dict: fields[key].col_type.encoding === TEncodingType.DICT // eslint-disable-line no-undef
	          });
	        }
	      }
	      return fieldsArray;
	    }

	    /**
	     * Disconnect from the server then clears the client and session values.
	     * @return {MapdCon} Object
	     *
	     * @example <caption>Disconnect from the server:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect(); // Create a connection
	     *
	     * con.disconnect();
	     * // con.client() === null;
	     * // con.sessionId() === null;
	     */

	  }, {
	    key: "disconnect",
	    value: function disconnect(callback) {
	      var _this3 = this;

	      if (this._sessionId !== null) {
	        for (var c = 0; c < this._client.length; c++) {
	          this._client[c].disconnect(this._sessionId[c], function (error) {
	            // Success will return NULL

	            if (error) {
	              return callback(error);
	            }
	            _this3._sessionId = null;
	            _this3._client = null;
	            _this3._numConnections = 0;
	            _this3.serverPingTimes = null;
	            return callback();
	          });
	        }
	      }
	      return this;
	    }

	    /**
	     * Get the recent dashboards as a list of <code>TFrontendView</code> objects.
	     * These objects contain a value for the <code>view_name</code> property,
	     * but not for the <code>view_state</code> property.
	     * @return {Array<TFrontendView>}
	     *
	     * @example <caption>Get the list of dashboards from the server:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect(); // Create a connection
	     *
	     * var views = con.getFrontendViews();
	     * // views === [TFrontendView, TFrontendView]
	     */


	    /**
	     * Get a dashboard object containing a value for the <code>view_state</code> property.
	     * This object contains a value for the <code>view_state</code> property,
	     * but not for the <code>view_name</code> property.
	     * @param {String} viewName - the name of the dashboard
	     * @return {TFrontendView} Object
	     *
	     * @example <caption>Get a specific dashboard from the server:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect(); // Create a connection
	     *
	     * var dashboard = con.getFrontendView();
	     * // dashboard instanceof TFrontendView === true
	     */


	    /**
	     * Get the status of the server as a <code>TServerStatus</code> object.
	     * This includes whether the server is read-only,
	     * has backend rendering enabled, and the version number.
	     * @return {TServerStatus} Object
	     *
	     * @example <caption>Get the server status:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect(); // Create a connection
	     *
	     * var status = con.getServerStatus();
	     * // status instanceof TServerStatus === true
	     *
	     */


	    /**
	     * Add a new dashboard to the server.
	     * @param {String} viewName - the name of the new dashboard
	     * @param {String} viewState - the base64-encoded state string of the new dashboard
	     * @param {String} imageHash - the numeric hash of the dashboard thumbnail
	     * @param {String} metaData - Stringified metaData related to the view
	     * @return {MapdCon} Object
	     *
	     * @example <caption>Add a new dashboard to the server:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect();
	     *
	     * con.createFrontendView('newView', 'GlnaHRz...', '1906667617');
	     */


	    /**
	     * Delete a dashboard object containing a value for the <code>view_state</code> property.
	     * @param {String} viewName - the name of the dashboard
	     * @param {Function} callback
	     * @return {TFrontendView} Object
	     *
	     * @example <caption>Delete a specific dashboard from the server:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect(); // Create a connection
	     *
	     * con.deleteFrontendView(viewName);
	     */

	  }, {
	    key: "createLinkAsync",


	    /**
	     * Create a short hash to make it easy to share a link to a specific dashboard.
	     * @param {String} viewState - the base64-encoded state string of the new dashboard
	     * @param {String} metaData - Stringified metaData related to the link
	     * @return {String} link - A short hash of the dashboard used for URLs
	     *
	     * @example <caption>Create a link to the current state of a dashboard:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect();
	     *
	     * // get a dashboard
	     * var dashboards = con.getFrontendViews();
	     * var dashboard = con.getFrontendView(dashboards[0].view_name);
	     *
	     * var link = con.createLink(dashboard.view_state);
	     * // link === 'CRtzoe'
	     */
	    value: function createLinkAsync(viewState, metaData) {
	      var _this4 = this;

	      return Promise.all(this._client.map(function (client, i) {
	        return new Promise(function (resolve, reject) {
	          client.create_link(_this4._sessionId[i], viewState, metaData, function (error, data) {
	            if (error) {
	              reject(error);
	            } else {
	              var result = data.split(",").reduce(function (links, link) {
	                if (links.indexOf(link) === -1) {
	                  links.push(link);
	                }
	                return links;
	              }, []);
	              if (!result || result.length !== 1) {
	                reject(new Error("Different links were created on connection"));
	              } else {
	                resolve(result.join());
	              }
	            }
	          });
	        });
	      }));
	    }

	    /**
	     * Get a fully-formed dashboard object from a generated share link.
	     * This object contains the given link for the <code>view_name</code> property,
	     * @param {String} link - the short hash of the dashboard, see {@link createLink}
	     * @return {TFrontendView} Object
	     *
	     * @example <caption>Get a dashboard from a link:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect();
	     *
	     * var dashboard = con.getLinkView('CRtzoe');
	     * // dashboard instanceof TFrontendView === true
	     */

	  }, {
	    key: "detectColumnTypes",


	    /**
	     * Asynchronously get the data from an importable file,
	     * such as a .csv or plaintext file with a header.
	     * @param {String} fileName - the name of the importable file
	     * @param {TCopyParams} copyParams - see {@link TCopyParams}
	     * @param {Function} callback - specify a callback that takes a
	     *                              {@link TDetectResult} as its only argument
	     *
	     * @example <caption>Get data from table_data.csv:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect();
	     *
	     * var copyParams = new TCopyParams();
	     * con.detectColumnTypes('table_data.csv', copyParams, function(tableData){
	     *   var columnHeaders = tableData.row_set.row_desc;
	     *   // columnHeaders === [TColumnType, TColumnType, ...]
	     *
	     *   var data = tableData.row_set.rows;
	     *   ...
	     * });
	     */
	    value: function detectColumnTypes(fileName, copyParams, callback) {
	      var thriftCopyParams = helpers.convertObjectToThriftCopyParams(copyParams);
	      this._client[0].detect_column_types(this._sessionId[0], fileName, thriftCopyParams, function (err, res) {
	        if (err) {
	          callback(err);
	        } else {
	          callback(null, res);
	        }
	      });
	    }
	  }, {
	    key: "detectColumnTypesAsync",
	    value: function detectColumnTypesAsync(fileName, copyParams) {
	      var _this5 = this;

	      return new Promise(function (resolve, reject) {
	        _this5.detectColumnTypes.bind(_this5, fileName, copyParams)(function (err, res) {
	          if (err) {
	            reject(err);
	          } else {
	            _this5.importerRowDesc = res.row_set.row_desc;
	            resolve(res);
	          }
	        });
	      });
	    }

	    /**
	     * Submit a query to the database and process the results through an array
	     * of asychronous callbacks. If no callbacks are given, use synchronous instead.
	     * @param {String} query - The query to perform
	     * @param {Object} options - the options for the query
	     * @param {Boolean} options.columnarResults=true - Indicates whether to return the data
	     *                                             in columnar format. This saves time on the backend.
	     * @param {Boolean} options.eliminateNullRows
	     * @param {Array<Function>} callbacks
	     */

	  }, {
	    key: "query",
	    value: function query(_query, options, callback) {
	      var _this6 = this;

	      var columnarResults = true;
	      var eliminateNullRows = false;
	      var queryId = null;
	      var returnTiming = false;
	      var limit = -1;
	      if (options) {
	        columnarResults = options.hasOwnProperty("columnarResults") ? options.columnarResults : columnarResults;
	        eliminateNullRows = options.hasOwnProperty("eliminateNullRows") ? options.eliminateNullRows : eliminateNullRows;
	        queryId = options.hasOwnProperty("queryId") ? options.queryId : queryId;
	        returnTiming = options.hasOwnProperty("returnTiming") ? options.returnTiming : returnTiming;
	        limit = options.hasOwnProperty("limit") ? options.limit : limit;
	      }

	      var lastQueryTime = queryId in this.queryTimes ? this.queryTimes[queryId] : this.DEFAULT_QUERY_TIME;

	      var curNonce = (this._nonce++).toString();

	      var conId = 0;

	      var processResultsOptions = {
	        returnTiming: returnTiming,
	        eliminateNullRows: eliminateNullRows,
	        query: _query,
	        queryId: queryId,
	        conId: conId,
	        estimatedQueryTime: lastQueryTime
	      };

	      try {
	        if (callback) {
	          this._client[conId].sql_execute(this._sessionId[conId], _query, columnarResults, curNonce, limit, function (error, result) {
	            if (error) {
	              callback(error);
	            } else {
	              _this6.processResults(processResultsOptions, result, callback);
	            }
	          });
	          return curNonce;
	        } else if (!callback) {
	          var SQLExecuteResult = this._client[conId].sql_execute(this._sessionId[conId], _query, columnarResults, curNonce, limit);
	          return this.processResults(processResultsOptions, SQLExecuteResult);
	        }
	      } catch (err) {
	        if (err.name === "NetworkError") {
	          this.removeConnection(conId);
	          if (this._numConnections === 0) {
	            err.msg = "No remaining database connections";
	            throw err;
	          }
	          this.query(_query, options, callback);
	        } else if (callback) {
	          callback(err);
	        } else {
	          throw err;
	        }
	      }
	    }
	  }, {
	    key: "validateQuery",
	    value: function validateQuery(query) {
	      var _this7 = this;

	      return new Promise(function (resolve, reject) {
	        _this7._client[0].sql_validate(_this7._sessionId[0], query, function (err, res) {
	          if (err) {
	            reject(err);
	          } else {
	            resolve(_this7.convertFromThriftTypes(res));
	          }
	        });
	      });
	    }

	    /**
	     * TODO
	     */

	  }, {
	    key: "removeConnection",
	    value: function removeConnection(conId) {
	      if (conId < 0 || conId >= this.numConnections) {
	        var err = {
	          msg: "Remove connection id invalid"
	        };
	        throw err;
	      }
	      this._client.splice(conId, 1);
	      this._sessionId.splice(conId, 1);
	      this._numConnections--;
	    }

	    /**
	     * Get the names of the databases that exist on the current session's connectdion.
	     * @return {Array<Object>} list of table objects containing the label and table names.
	     *
	     * @example <caption>Get the list of tables from a connection:</caption>
	     * var tables = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect()
	     *   .getTables();
	     * // tables === [{
	     *    label: 'obs', // deprecated property
	     *    name: 'myDatabaseName'
	     *  }, ...]
	     */

	  }, {
	    key: "getTables",
	    value: function getTables(callback) {
	      this._client[0].get_tables(this._sessionId[0], function (error, tables) {
	        if (error) {
	          callback(error);
	        } else {
	          callback(null, tables.map(function (table) {
	            return {
	              name: table,
	              label: "obs"
	            };
	          }));
	        }
	      });
	    }
	  }, {
	    key: "getTablesAsync",
	    value: function getTablesAsync() {
	      var _this8 = this;

	      return new Promise(function (resolve, reject) {
	        _this8.getTables.bind(_this8)(function (error, tables) {
	          if (error) {
	            reject(error);
	          } else {
	            resolve(tables);
	          }
	        });
	      });
	    }

	    /**
	     * Create an array-like object from {@link TDatumType} by
	     * flipping the string key and numerical value around.
	     */

	  }, {
	    key: "invertDatumTypes",
	    value: function invertDatumTypes() {
	      var datumType = TDatumType; // eslint-disable-line no-undef
	      for (var key in datumType) {
	        if (datumType.hasOwnProperty(key)) {
	          this._datumEnum[datumType[key]] = key;
	        }
	      }
	    }

	    /**
	     * Get a list of field objects for a given table.
	     * @param {String} tableName - name of table containing field names
	     * @return {Array<Object>} fields - the formmatted list of field objects
	     *
	     * @example <caption>Get the list of fields from a specific table:</caption>
	     * var tables = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect()
	     *   .getTables();
	     *
	     * var fields = con.getFields(tables[0].name);
	     * // fields === [{
	     *   name: 'fieldName',
	     *   type: 'BIGINT',
	     *   is_array: false,
	     *   is_dict: false
	     * }, ...]
	     */

	  }, {
	    key: "getFields",
	    value: function getFields(tableName, callback) {
	      var _this9 = this;

	      this._client[0].get_table_details(this._sessionId[0], tableName, function (fields) {
	        if (fields) {
	          var rowDict = fields.row_desc.reduce(function (accum, value) {
	            accum[value.col_name] = value;
	            return accum;
	          }, {});
	          callback(null, _this9.convertFromThriftTypes(rowDict));
	        } else {
	          callback(new Error("Table (" + tableName + ") not found"));
	        }
	      });
	    }

	    /**
	     * Create a table and persist it to the backend.
	     * @param {String} tableName - desired name of the new table
	     * @param {Array<TColumnType>} rowDesc - fields of the new table
	     * @param {Function} callback
	     *
	     * @example <caption>Create a new table:</caption>
	     * var result = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect()
	     *   .createTable('mynewtable', [TColumnType, TColumnType, ...], cb);
	     */

	  }, {
	    key: "createTable",
	    value: function createTable(tableName, rowDescObj, tableType, callback) {
	      if (!this._sessionId) {
	        throw new Error("You are not connected to a server. Try running the connect method first.");
	      }

	      var thriftRowDesc = helpers.mutateThriftRowDesc(rowDescObj, this.importerRowDesc);

	      for (var c = 0; c < this._numConnections; c++) {
	        this._client[c].create_table(this._sessionId[c], tableName, thriftRowDesc, tableType, function (err) {
	          if (err) {
	            callback(err);
	          } else {
	            callback();
	          }
	        });
	      }
	    }
	  }, {
	    key: "importTable",


	    /**
	     * Import a table from a file.
	     * @param {String} tableName - desired name of the new table
	     * @param {String} fileName
	     * @param {TCopyParams} copyParams - see {@link TCopyParams}
	     * @param {Function} callback
	     */
	    value: function importTable(tableName, fileName, copyParams, rowDescObj, isShapeFile, callback) {
	      if (!this._sessionId) {
	        throw new Error("You are not connected to a server. Try running the connect method first.");
	      }

	      var thriftCopyParams = helpers.convertObjectToThriftCopyParams(copyParams);
	      var thriftRowDesc = helpers.mutateThriftRowDesc(rowDescObj, this.importerRowDesc);

	      var thriftCallBack = function thriftCallBack(err, res) {
	        if (err) {
	          callback(err);
	        } else {
	          callback(null, res);
	        }
	      };

	      for (var c = 0; c < this._numConnections; c++) {
	        if (isShapeFile) {
	          this._client[c].import_geo_table(this._sessionId[c], tableName, fileName, thriftCopyParams, thriftRowDesc, thriftCallBack);
	        } else {
	          this._client[c].import_table(this._sessionId[c], tableName, fileName, thriftCopyParams, thriftCallBack);
	        }
	      }
	    }
	  }, {
	    key: "importTableAsyncWrapper",
	    value: function importTableAsyncWrapper(isShapeFile) {
	      var _this10 = this;

	      return function (tableName, fileName, copyParams, headers) {
	        return new Promise(function (resolve, reject) {
	          _this10.importTable(tableName, fileName, copyParams, headers, isShapeFile, function (err, link) {
	            if (err) {
	              reject(err);
	            } else {
	              resolve(link);
	            }
	          });
	        });
	      };
	    }
	  }, {
	    key: "renderVega",


	    /**
	     * Use for backend rendering. This method will fetch a PNG image
	     * that is a render of the vega json object.
	     *
	     * @param {Number} widgetId - the widget id of the calling widget
	     * @param {String} vega - the vega json
	     * @param {Object} options - the options for the render query
	     * @param {Number} options.compressionLevel - the png compression level.
	     *                  range 1 (low compression, faster) to 10 (high compression, slower).
	     *                  Default 3.
	     * @param {Function} callback
	     */

	    value: function renderVega(widgetid, vega, options, callback) /* istanbul ignore next */{
	      var _this11 = this;

	      var queryId = null;
	      var compressionLevel = COMPRESSION_LEVEL_DEFAULT;
	      if (options) {
	        queryId = options.hasOwnProperty("queryId") ? options.queryId : queryId;
	        compressionLevel = options.hasOwnProperty("compressionLevel") ? options.compressionLevel : compressionLevel;
	      }

	      var lastQueryTime = queryId in this.queryTimes ? this.queryTimes[queryId] : this.DEFAULT_QUERY_TIME;

	      var curNonce = (this._nonce++).toString();

	      var conId = 0;
	      this._lastRenderCon = conId;

	      var processResultsOptions = {
	        isImage: true,
	        query: "render: " + vega,
	        queryId: queryId,
	        conId: conId,
	        estimatedQueryTime: lastQueryTime
	      };

	      try {
	        if (!callback) {
	          var renderResult = this._client[conId].render_vega(this._sessionId[conId], widgetid, vega, compressionLevel, curNonce);
	          return this.processResults(processResultsOptions, renderResult);
	        }

	        this._client[conId].render_vega(this._sessionId[conId], widgetid, vega, compressionLevel, curNonce, function (error, result) {
	          if (error) {
	            callback(error);
	          } else {
	            _this11.processResults(processResultsOptions, result, callback);
	          }
	        });
	      } catch (err) {
	        throw err;
	      }

	      return curNonce;
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

	  }, {
	    key: "getResultRowForPixel",
	    value: function getResultRowForPixel(widgetId, pixel, tableColNamesMap, callbacks) /* istanbul ignore next */{
	      var pixelRadius = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 2;

	      var columnFormat = true; // BOOL
	      var curNonce = (this._nonce++).toString();
	      try {
	        if (!callbacks) {
	          return this.processPixelResults(undefined, // eslint-disable-line no-undefined
	          this._client[this._lastRenderCon].get_result_row_for_pixel(this._sessionId[this._lastRenderCon], widgetId, pixel, tableColNamesMap, columnFormat, pixelRadius, curNonce));
	        }
	        this._client[this._lastRenderCon].get_result_row_for_pixel(this._sessionId[this._lastRenderCon], widgetId, pixel, tableColNamesMap, columnFormat, pixelRadius, curNonce, this.processPixelResults.bind(this, callbacks));
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

	  }, {
	    key: "processPixelResults",
	    value: function processPixelResults(callbacks, results) {
	      results = Array.isArray(results) ? results.pixel_rows : [results];
	      var numPixels = results.length;
	      var processResultsOptions = {
	        isImage: false,
	        eliminateNullRows: false,
	        query: "pixel request",
	        queryId: -2
	      };
	      for (var p = 0; p < numPixels; p++) {
	        results[p].row_set = this.processResults(processResultsOptions, results[p]);
	      }
	      if (!callbacks) {
	        return results;
	      }
	      callbacks.pop()(results, callbacks);
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

	  }, {
	    key: "sessionId",
	    value: function sessionId(_sessionId) {
	      if (!arguments.length) {
	        return this._sessionId;
	      }
	      this._sessionId = _sessionId;
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

	  }, {
	    key: "host",
	    value: function host(_host) {
	      if (!arguments.length) {
	        return this._host;
	      }
	      this._host = arrayify(_host);
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

	  }, {
	    key: "port",
	    value: function port(_port) {
	      if (!arguments.length) {
	        return this._port;
	      }
	      this._port = arrayify(_port);
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

	  }, {
	    key: "user",
	    value: function user(_user) {
	      if (!arguments.length) {
	        return this._user;
	      }
	      this._user = arrayify(_user);
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

	  }, {
	    key: "password",
	    value: function password(_password) {
	      if (!arguments.length) {
	        return this._password;
	      }
	      this._password = arrayify(_password);
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

	  }, {
	    key: "dbName",
	    value: function dbName(_dbName) {
	      if (!arguments.length) {
	        return this._dbName;
	      }
	      this._dbName = arrayify(_dbName);
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

	  }, {
	    key: "logging",
	    value: function logging(_logging) {
	      if (typeof _logging === "undefined") {
	        return this._logging;
	      } else if (typeof _logging !== "boolean") {
	        return "logging can only be set with boolean values";
	      }
	      this._logging = _logging;
	      var isEnabledTxt = _logging ? "enabled" : "disabled";
	      return "SQL logging is now " + isEnabledTxt;
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

	  }, {
	    key: "platform",
	    value: function platform(_platform) {
	      if (!arguments.length) {
	        return this._platform;
	      }
	      this._platform = _platform;
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

	  }, {
	    key: "numConnections",
	    value: function numConnections() {
	      return this._numConnections;
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

	  }, {
	    key: "protocol",
	    value: function protocol(_protocol) {
	      if (!arguments.length) {
	        return this._protocol;
	      }
	      this._protocol = arrayify(_protocol);
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

	  }, {
	    key: "getEndpoints",
	    value: function getEndpoints() {
	      var _this12 = this;

	      return this._host.map(function (host, i) {
	        return _this12._protocol[i] + "://" + host + ":" + _this12._port[i];
	      });
	    }
	  }]);

	  return MapdCon;
	}();

	// Set a global mapdcon function when mapdcon is brought in via script tag.


	if (( false ? "undefined" : _typeof(module)) === "object" && module.exports) {
	  if (window) {
	    window.MapdCon = MapdCon;
	  }
	}

	exports.default = new MapdCon();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }),
/* 3 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var convertObjectToThriftCopyParams = exports.convertObjectToThriftCopyParams = function convertObjectToThriftCopyParams(obj) {
	  return new TCopyParams(obj);
	}; // eslint-disable-line no-undef

	var mutateThriftRowDesc = exports.mutateThriftRowDesc = function mutateThriftRowDesc(rowDescArray, thriftRowDescArray) {
	  rowDescArray.forEach(function (obj, i) {
	    thriftRowDescArray[i].col_name = obj.clean_col_name;
	    thriftRowDescArray[i].col_type.encoding = obj.col_type.encoding;
	    thriftRowDescArray[i].col_type.type = obj.col_type.type;
	  });
	  return thriftRowDescArray;
	};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = MapDClientV2;

	var _wrapWithErrorHandling = __webpack_require__(5);

	function MapDClientV2(protocol) {
	  MapDClient.call(this, protocol);
	} /* global MapDClient*/

	MapDClientV2.prototype = Object.create(MapDClient.prototype);

	MapDClientV2.prototype.connect = function () {
	  var connectWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "connect");
	  return connectWithErrorHandling.apply(undefined, arguments);
	};

	MapDClientV2.prototype.sql_execute = function () {
	  var SQLExecuteWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "sql_execute");
	  return SQLExecuteWithErrorHandling.apply(undefined, arguments);
	};

	MapDClientV2.prototype.sql_validate = function () {
	  var SQLValidateWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "sql_validate");
	  return SQLValidateWithErrorHandling.apply(undefined, arguments);
	};

	MapDClientV2.prototype.render = function () {
	  var renderWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "render");
	  return renderWithErrorHandling.apply(undefined, arguments);
	};

	/* istanbul ignore next */
	MapDClientV2.prototype.render_vega = function () {
	  var renderVegaWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "render_vega");
	  return renderVegaWithErrorHandling.apply(undefined, arguments);
	};

	MapDClientV2.prototype.delete_frontend_view = function () {
	  var deleteFrontendViewWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "delete_frontend_view");
	  return deleteFrontendViewWithErrorHandling.apply(undefined, arguments);
	};

	MapDClientV2.prototype.get_tables = function () {
	  var getTablesWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "get_tables");
	  return getTablesWithErrorHandling.apply(undefined, arguments);
	};

	MapDClientV2.prototype.get_frontend_views = function () {
	  var getFrontEndViewsWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "get_frontend_views");
	  return getFrontEndViewsWithErrorHandling.apply(undefined, arguments);
	};

	MapDClientV2.prototype.get_frontend_view = function () {
	  var getFrontEndViewWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "get_frontend_view");
	  return getFrontEndViewWithErrorHandling.apply(undefined, arguments);
	};

	MapDClientV2.prototype.create_link = function () {
	  var createLinkWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "create_link");
	  return createLinkWithErrorHandling.apply(undefined, arguments);
	};

	MapDClientV2.prototype.create_frontend_view = function () {
	  var createFrontEndViewWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "create_frontend_view");
	  return createFrontEndViewWithErrorHandling.apply(undefined, arguments);
	};

	MapDClientV2.prototype.send_create_table = function () {
	  var sendCreateTableWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "send_create_table");
	  return sendCreateTableWithErrorHandling.apply(undefined, arguments);
	};

	MapDClientV2.prototype.send_import_table = function () {
	  var sendImportTableWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "send_import_table");
	  return sendImportTableWithErrorHandling.apply(undefined, arguments);
	};

	MapDClientV2.prototype.detect_column_types = function () {
	  var detectColumnTypesWithErrorHandling = (0, _wrapWithErrorHandling.wrapWithErrorHandling)(this, "detect_column_types");
	  return detectColumnTypesWithErrorHandling.apply(undefined, arguments);
	};

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isResultError = isResultError;
	exports.createResultError = createResultError;
	exports.wrapMethod = wrapMethod;
	exports.wrapWithErrorHandling = wrapWithErrorHandling;
	/* global Thrift, TMapDException, MapDClient*/

	function isResultError(result) {
	  return result instanceof Thrift.TException || result instanceof Error;
	}

	function createResultError(result) {
	  if (result instanceof TMapDException) {
	    return new Error(result.error_msg);
	  } else if (typeof result.message === "undefined") {
	    return new Error("Unspecified Error");
	  } else {
	    return new Error(result.message);
	  }
	}

	function wrapMethod(context, method, isError) {
	  // eslint-disable-line consistent-this
	  return function wrapped() {
	    var arity = MapDClient.prototype[method].length;

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    if (args.length === arity) {
	      var _MapDClient$prototype;

	      var callback = args.pop();
	      (_MapDClient$prototype = MapDClient.prototype[method]).call.apply(_MapDClient$prototype, [context].concat(args, [function (result) {
	        if (isError(result)) {
	          callback(createResultError(result));
	        } else {
	          callback(null, result);
	        }
	      }]));
	    } else if (args.length === arity - 1) {
	      var _MapDClient$prototype2;

	      var result = (_MapDClient$prototype2 = MapDClient.prototype[method]).call.apply(_MapDClient$prototype2, [context].concat(args));
	      if (isError(result)) {
	        throw createResultError(result);
	      }
	      return result;
	    } else {
	      throw new Error("Insufficient arguments to run this method " + method);
	    }
	  };
	}

	function wrapWithErrorHandling(context, method) {
	  // eslint-disable-line consistent-this
	  return wrapMethod(context, method, isResultError);
	}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = processQueryResults;

	var _processColumnarResults = __webpack_require__(7);

	var _processColumnarResults2 = _interopRequireDefault(_processColumnarResults);

	var _processRowResults = __webpack_require__(8);

	var _processRowResults2 = _interopRequireDefault(_processRowResults);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
	function processQueryResults(logging, updateQueryTimes) {
	  return function (options, _datumEnum, result, callback) {
	    var isImage = false;
	    var eliminateNullRows = false;
	    var query = null;
	    var queryId = null;
	    var conId = null;
	    var estimatedQueryTime = null;
	    var hasCallback = Boolean(callback);

	    if (typeof options !== "undefined") {
	      isImage = options.isImage ? options.isImage : false;
	      eliminateNullRows = options.eliminateNullRows ? options.eliminateNullRows : false;
	      query = options.query ? options.query : null;
	      queryId = options.queryId ? options.queryId : null;
	      conId = typeof options.conId === "undefined" ? null : options.conId;
	      estimatedQueryTime = typeof options.estimatedQueryTime === "undefined" ? null : options.estimatedQueryTime;
	    }
	    if (result.execution_time_ms && conId !== null && estimatedQueryTime !== null) {
	      updateQueryTimes(conId, queryId, estimatedQueryTime, result.execution_time_ms);
	    }

	    // should use node_env
	    if (logging && result.execution_time_ms) {
	      console.log(query, "on Server", conId, "- Execution Time:", result.execution_time_ms, " ms, Total Time:", result.total_time_ms + "ms");
	    }

	    if (isImage && hasCallback) {
	      callback(null, result);
	    } else if (isImage && !hasCallback) {
	      return result;
	    } else {
	      var formattedResult = null;

	      if (!result.row_set) {
	        if (hasCallback) {
	          callback(new Error("No result to process"));
	        } else {
	          throw new Error("No result to process");
	        }
	        return;
	      }

	      if (result.row_set.is_columnar) {
	        formattedResult = (0, _processColumnarResults2.default)(result.row_set, eliminateNullRows, _datumEnum);
	      } else {
	        formattedResult = (0, _processRowResults2.default)(result.row_set, eliminateNullRows, _datumEnum);
	      }

	      formattedResult.timing = {
	        execution_time_ms: result.execution_time_ms,
	        total_time_ms: result.total_time_ms
	      };

	      if (hasCallback) {
	        callback(null, options.returnTiming ? formattedResult : formattedResult.results);
	      } else {
	        return options.returnTiming ? formattedResult : formattedResult.results;
	      }
	    }
	  };
	}

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = processColumnarResults;
	/**
	   * Because it is inefficient for the server to return a row-based
	   * data structure, it is better to process the column-based results into a row-based
	   * format after the fact.
	   *
	   * @param {TRowSet} data - The column-based data returned from a query
	   * @param {Boolean} eliminateNullRows
	   * @returns {Object} processedResults
	   */
	function processColumnarResults(data, eliminateNullRows, dataEnum) {
	  var formattedResult = { fields: [], results: [] };
	  var numCols = data.row_desc.length;
	  var numRows = typeof data.columns[0] === "undefined" ? 0 : data.columns[0].nulls.length;

	  formattedResult.fields = data.row_desc.map(function (field) {
	    return {
	      name: field.col_name,
	      type: dataEnum[field.col_type.type],
	      is_array: field.col_type.is_array
	    };
	  });

	  for (var r = 0; r < numRows; r++) {
	    if (eliminateNullRows) {
	      var rowHasNull = false;
	      for (var c = 0; c < numCols; c++) {
	        if (data.columns[c].nulls[r]) {
	          rowHasNull = true;
	          break;
	        }
	      }
	      if (rowHasNull) {
	        continue; // eslint-disable-line no-continue
	      }
	    }
	    var row = {};
	    for (var _c = 0; _c < numCols; _c++) {
	      var fieldName = formattedResult.fields[_c].name;
	      var fieldType = formattedResult.fields[_c].type;
	      var fieldIsArray = formattedResult.fields[_c].is_array;
	      var isNull = data.columns[_c].nulls[r];
	      if (isNull) {
	        // row[fieldName] = "NULL";
	        row[fieldName] = null;
	        continue; // eslint-disable-line no-continue
	      }
	      if (fieldIsArray) {
	        row[fieldName] = [];
	        var arrayNumElems = data.columns[_c].data.arr_col[r].nulls.length;
	        for (var e = 0; e < arrayNumElems; e++) {
	          if (data.columns[_c].data.arr_col[r].nulls[e]) {
	            row[fieldName].push("NULL");
	            continue; // eslint-disable-line no-continue
	          }
	          switch (fieldType) {
	            case "BOOL":
	              row[fieldName].push(Boolean(data.columns[_c].data.arr_col[r].data.int_col[e]));
	              break;
	            case "SMALLINT":
	            case "INT":
	            case "BIGINT":
	              row[fieldName].push(data.columns[_c].data.arr_col[r].data.int_col[e]);
	              break;
	            case "FLOAT":
	            case "DOUBLE":
	            case "DECIMAL":
	              row[fieldName].push(data.columns[_c].data.arr_col[r].data.real_col[e]);
	              break;
	            case "STR":
	              row[fieldName].push(data.columns[_c].data.arr_col[r].data.str_col[e]);
	              break;
	            case "TIME":
	            case "TIMESTAMP":
	            case "DATE":
	              row[fieldName].push(data.columns[_c].data.arr_col[r].data.int_col[e] * 1000); // eslint-disable-line no-magic-numbers
	              break;
	            default:
	              break;
	          }
	        }
	      } else {
	        switch (fieldType) {
	          case "BOOL":
	            row[fieldName] = Boolean(data.columns[_c].data.int_col[r]);
	            break;
	          case "SMALLINT":
	          case "INT":
	          case "BIGINT":
	            row[fieldName] = data.columns[_c].data.int_col[r];
	            break;
	          case "FLOAT":
	          case "DOUBLE":
	          case "DECIMAL":
	            row[fieldName] = data.columns[_c].data.real_col[r];
	            break;
	          case "STR":
	            row[fieldName] = data.columns[_c].data.str_col[r];
	            break;
	          case "TIME":
	          case "TIMESTAMP":
	          case "DATE":
	            row[fieldName] = new Date(data.columns[_c].data.int_col[r] * 1000); // eslint-disable-line no-magic-numbers
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

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = processRowResults;
	/**
	   * It should be avoided to query for row-based results from the server, howerver
	   * it can still be done. In this case, still process them into the same format as
	   * (@link processColumnarResults} to keep the output consistent.
	   * @param {TRowSet} data - The row-based data returned from a query
	   * @param {Boolean} eliminateNullRows
	   * @returns {Object} processedResults
	   */
	function processRowResults(data, eliminateNullRows, datumEnum) {
	  var numCols = data.row_desc.length;
	  var formattedResult = { fields: [], results: [] };

	  formattedResult.fields = data.row_desc.map(function (field) {
	    return {
	      name: field.col_name,
	      type: datumEnum[field.col_type.type],
	      is_array: field.col_type.is_array
	    };
	  });

	  formattedResult.results = [];
	  var numRows = 0;
	  if (typeof data.rows !== "undefined" && data.rows !== null) {
	    numRows = data.rows.length; // so won't throw if data.rows is missing
	  }

	  for (var r = 0; r < numRows; r++) {
	    if (eliminateNullRows) {
	      var rowHasNull = false;
	      for (var c = 0; c < numCols; c++) {
	        if (data.rows[r].columns[c].is_null) {
	          rowHasNull = true;
	          break;
	        }
	      }
	      if (rowHasNull) {
	        continue; // eslint-disable-line no-continue
	      }
	    }

	    var row = {};
	    for (var _c = 0; _c < numCols; _c++) {
	      var fieldName = formattedResult.fields[_c].name;
	      var fieldType = formattedResult.fields[_c].type;
	      var fieldIsArray = formattedResult.fields[_c].is_array;
	      if (fieldIsArray) {
	        if (data.rows[r].cols[_c].is_null) {
	          row[fieldName] = "NULL";
	          continue; // eslint-disable-line no-continue
	        }
	        row[fieldName] = [];
	        var arrayNumElems = data.rows[r].cols[_c].val.arr_val.length;
	        for (var e = 0; e < arrayNumElems; e++) {
	          var elemDatum = data.rows[r].cols[_c].val.arr_val[e];
	          if (elemDatum.is_null) {
	            row[fieldName].push("NULL");
	            continue; // eslint-disable-line no-continue
	          }
	          switch (fieldType) {
	            case "BOOL":
	              row[fieldName].push(Boolean(elemDatum.val.int_val));
	              break;
	            case "SMALLINT":
	            case "INT":
	            case "BIGINT":
	              row[fieldName].push(elemDatum.val.int_val);
	              break;
	            case "FLOAT":
	            case "DOUBLE":
	            case "DECIMAL":
	              row[fieldName].push(elemDatum.val.real_val);
	              break;
	            case "STR":
	              row[fieldName].push(elemDatum.val.str_val);
	              break;
	            case "TIME":
	            case "TIMESTAMP":
	            case "DATE":
	              row[fieldName].push(elemDatum.val.int_val * 1000); // eslint-disable-line no-magic-numbers
	              break;
	            default:
	              break;
	          }
	        }
	      } else {
	        var scalarDatum = data.rows[r].cols[_c];
	        if (scalarDatum.is_null) {
	          row[fieldName] = "NULL";
	          continue; // eslint-disable-line no-continue
	        }
	        switch (fieldType) {
	          case "BOOL":
	            row[fieldName] = Boolean(scalarDatum.val.int_val);
	            break;
	          case "SMALLINT":
	          case "INT":
	          case "BIGINT":
	            row[fieldName] = scalarDatum.val.int_val;
	            break;
	          case "FLOAT":
	          case "DOUBLE":
	          case "DECIMAL":
	            row[fieldName] = scalarDatum.val.real_val;
	            break;
	          case "STR":
	            row[fieldName] = scalarDatum.val.str_val;
	            break;
	          case "TIME":
	          case "TIMESTAMP":
	          case "DATE":
	            row[fieldName] = new Date(scalarDatum.val.int_val * 1000); // eslint-disable-line no-magic-numbers
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

/***/ })
/******/ ]);