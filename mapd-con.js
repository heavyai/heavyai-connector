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
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var MapdCon = function () {
	  function MapdCon() {
	    _classCallCheck(this, MapdCon);

	    // Set up "private" variables and their defaults
	    this._host = null;
	    this._user = null;
	    this._password = null; // to be changed
	    this._port = null;
	    this._dbName = null;
	    this._transport = null;
	    this._protocol = null;
	    this._client = null;
	    this._sessionId = null;
	    this._datumEnum = {};
	    this._nonce = 0;
	    this._logging = false;

	    // invoke initialization methods
	    this.invertDatumTypes();
	  }

	  _createClass(MapdCon, [{
	    key: "getSessionId",
	    value: function getSessionId() {
	      return this._sessionId;
	    }
	  }, {
	    key: "getHost",
	    value: function getHost() {
	      return this._host;
	    }
	  }, {
	    key: "getPort",
	    value: function getPort() {
	      return this._port;
	    }
	  }, {
	    key: "getUser",
	    value: function getUser() {
	      return this._user;
	    }
	  }, {
	    key: "getDb",
	    value: function getDb() {
	      return this._dbName;
	    }
	  }, {
	    key: "getUploadServer",
	    value: function getUploadServer() {
	      return ""; // empty string: same as frontend server
	    }

	    /**
	     * Set or get the logging flag
	     * @param {Boolean} _
	     */

	  }, {
	    key: "logging",
	    value: function logging(_) {
	      if (!arguments.length) {
	        return this._logging;
	      }
	      this._logging = _;
	      return this;
	    }
	  }, {
	    key: "setPlatform",
	    value: function setPlatform(newPlatform) {
	      //dummy function for now
	      return this;
	    }
	  }, {
	    key: "getPlatform",
	    value: function getPlatform() {
	      return "mapd";
	    }
	  }, {
	    key: "getClient",
	    value: function getClient() {
	      return this._client;
	    }
	  }, {
	    key: "setHost",
	    value: function setHost(newHost) {
	      this._host = newHost;
	      return this;
	    }
	  }, {
	    key: "setUserAndPassword",
	    value: function setUserAndPassword(newUser, newPassword) {
	      this._user = newUser;
	      this._password = newPassword;
	      return this;
	    }
	  }, {
	    key: "setPort",
	    value: function setPort(newPort) {
	      this._port = newPort;
	      return this;
	    }
	  }, {
	    key: "setDbName",
	    value: function setDbName(newDb) {
	      this._dbName = newDb;
	      return this;
	    }
	  }, {
	    key: "testConnection",
	    value: function testConnection() {
	      if (this._sessionId === null) {
	        return false;
	        //throw "Client not connected";
	      }
	      return true;
	    }
	  }, {
	    key: "connect",
	    value: function connect() {
	      var transportUrl = "http://" + this._host + ":" + this._port;
	      this._transport = new Thrift.Transport(transportUrl);
	      this._protocol = new Thrift.Protocol(this._transport);
	      this._client = new MapDClient(this._protocol);
	      this._sessionId = this._client.connect(this._user, this._password, this._dbName);
	      return this;
	    }
	  }, {
	    key: "disconnect",
	    value: function disconnect() {
	      if (this._sessionId !== null) {
	        this._client.disconnect(this._sessionId);
	        this._sessionId = null;
	      }
	      this._client = null;
	      this._protocol = null;
	      this._transport = null;
	    }
	  }, {
	    key: "getFrontendViews",
	    value: function getFrontendViews() {
	      var result = null;
	      try {
	        result = this._client.get_frontend_views(this._sessionId);
	      } catch (err) {
	        console.log(err);
	        if (err.name == "ThriftException") {
	          this.connect();
	          result = this._client.get_frontend_views(this._sessionId);
	        }
	      }
	      return result;
	    }
	  }, {
	    key: "getFrontendView",
	    value: function getFrontendView(viewName) {
	      var result = null;
	      try {
	        result = this._client.get_frontend_view(this._sessionId, viewName);
	      } catch (err) {
	        console.log(err);
	        if (err.name === "ThriftException") {
	          this.connect();
	          result = this._client.get_frontend_views(this._sessionId, viewName);
	        }
	      }
	      return result;
	    }
	  }, {
	    key: "getServerStatus",
	    value: function getServerStatus() {
	      var result = null;
	      try {
	        result = this._client.get_server_status();
	      } catch (err) {
	        console.log(err);
	        if (err.name == "ThriftException") {
	          this.connect();
	          result = this._client.get_server_status();
	        }
	      }
	      return result;
	    }
	  }, {
	    key: "createFrontendView",
	    value: function createFrontendView(viewName, viewState, imageHash) {
	      try {
	        this._client.create_frontend_view(this._sessionId, viewName, viewState, imageHash);
	      } catch (err) {
	        console.log(err);
	        if (err.name == "ThriftException") {
	          this.connect();
	          var result = this._client.get_frontend_views(this._sessionId, viewName, viewState, imageHash);
	        }
	      }
	    }
	  }, {
	    key: "createLink",
	    value: function createLink(viewState) {
	      try {
	        result = this._client.create_link(this._sessionId, viewState);
	      } catch (err) {
	        console.log(err);
	        if (err.name == "ThriftException") {
	          this.connect();
	          result = this._client.create_link(this._sessionId, viewState);
	        }
	      }
	      return result;
	    }
	  }, {
	    key: "getLinkView",
	    value: function getLinkView(link) {
	      try {
	        result = this._client.get_link_view(this._sessionId, link);
	      } catch (err) {
	        console.log(err);
	        if (err.name == "ThriftException") {
	          this.connect();
	          result = this._client.get_link_view(sessionId, link);
	        }
	      }
	      return result;
	    }
	  }, {
	    key: "detectColumnTypes",
	    value: function detectColumnTypes(fileName, copyParams, callback) {
	      var result = null;
	      copyParams.delimiter = copyParams.delimiter || "";
	      try {
	        result = this._client.detect_column_types(this._sessionId, fileName, copyParams, callback);
	      } catch (err) {
	        console.log(err);
	        if (err.name == "ThriftException") {
	          this.connect();
	          result = this._client.detect_column_types(this._sessionId, fileName, copyParams, callback);
	        }
	      }
	      return result;
	    }
	  }, {
	    key: "queryAsync",
	    value: function queryAsync(query, columnarResults, eliminateNullRows, renderSpec, callbacks) {
	      columnarResults = columnarResults === undefined ? true : columnarResults; // make columnar results default if not specified
	      var curNonce = (this._nonce++).toString();
	      try {
	        if (renderSpec !== undefined) {
	          var processResults = this.processResults.bind(this, true, eliminateNullRows, "render: " + query, callbacks);
	          this._client.render(this._sessionId, query + ";", renderSpec, {}, {}, curNonce, processResults);
	        } else {
	          var processResults = this.processResults.bind(this, false, eliminateNullRows, query, callbacks);
	          this._client.sql_execute(this._sessionId, query + ";", columnarResults, curNonce, processResults);
	        }
	      } catch (err) {
	        console.log(err);
	        if (err.name == "ThriftException") {
	          var processResults = processResults.bind(this, false, eliminateNullRows, query, callbacks);
	          this.connect();
	          this._client.sql_execute(this._sessionId, query + ";", columnarResults, curNonce, processResults);
	        } else if (err.name == "TMapDException") {
	          swal({ title: "Error!",
	            text: err.error_msg,
	            type: "error",
	            confirmButtonText: "Okay"
	          });

	          // google analytics send error
	          ga('send', 'event', 'error', 'async query error', err.error_msg, {
	            nonInteraction: true
	          });
	        } else {
	          throw err;
	        }
	      }
	      return curNonce;
	    }
	  }, {
	    key: "query",
	    value: function query(_query, columnarResults, eliminateNullRows, renderSpec) {
	      columnarResults = columnarResults === undefined ? true : columnarResults; // make columnar results default if not specified
	      var result = null;
	      var curNonce = (this._nonce++).toString();
	      try {
	        if (renderSpec !== undefined) {
	          result = this._client.render(this._sessionId, _query + ";", renderSpec, {}, {}, curNonce);
	        } else {
	          result = this._client.sql_execute(this._sessionId, _query + ";", columnarResults, curNonce);
	        }
	      } catch (err) {
	        console.log(err);
	        if (err.name == "ThriftException") {
	          this.connect();
	          result = this._client.sql_execute(this._sessionId, _query + ";", columnarResults, curNonce);
	        } else if (err.name == "TMapDException") {
	          swal({ title: "Error!",
	            text: err.error_msg,
	            type: "error",
	            confirmButtonText: "Okay"
	          });

	          // google analytics send error
	          ga('send', 'event', 'error', 'query error', err.error_msg, {
	            nonInteraction: true
	          });
	        } else {
	          throw err;
	        }
	      }

	      if (renderSpec !== undefined) {
	        return result;
	      }
	      _query = renderSpec ? "render: " + _query : _query;
	      return this.processResults(false, eliminateNullRows, _query, undefined, result); // undefined is callbacks slot
	    }
	  }, {
	    key: "processColumnarResults",
	    value: function processColumnarResults(data, eliminateNullRows) {
	      var formattedResult = { fields: [], results: [] };
	      var numCols = data.row_desc.length;
	      var numRows = 0;

	      for (var c = 0; c < numCols; c++) {
	        var field = data.row_desc[c];
	        formattedResult.fields.push({
	          "name": field.col_name,
	          "type": this._datumEnum[field.col_type.type],
	          "is_array": field.col_type.is_array
	        });
	      }

	      if (numCols > 0) {
	        numRows = data.columns[0] !== undefined ? data.columns[0].nulls.length : 0;
	      }

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
	            continue;
	          }
	        }
	        var row = {};
	        for (var c = 0; c < numCols; c++) {
	          var fieldName = formattedResult.fields[c].name;
	          var fieldType = formattedResult.fields[c].type;
	          var fieldIsArray = formattedResult.fields[c].is_array;
	          var isNull = data.columns[c].nulls[r];
	          if (isNull) {
	            // row[fieldName] = "NULL";
	            row[fieldName] = null;
	            continue;
	          }
	          if (fieldIsArray) {
	            row[fieldName] = [];
	            var arrayNumElems = data.columns[c].data.arr_col[r].nulls.length;
	            for (var e = 0; e < arrayNumElems; e++) {
	              if (data.columns[c].data.arr_col[r].nulls[e]) {
	                row[fieldName].push("NULL");
	                continue;
	              }
	              switch (fieldType) {
	                case "BOOL":
	                  row[fieldName].push(data.columns[c].data.arr_col[r].data.int_col[e] ? true : false);
	                  break;
	                case "SMALLINT":
	                case "INT":
	                case "BIGINT":
	                  row[fieldName].push(data.columns[c].data.arr_col[r].data.int_col[e]);
	                  break;
	                case "FLOAT":
	                case "DOUBLE":
	                case "DECIMAL":
	                  row[fieldName].push(data.columns[c].data.arr_col[r].data.real_col[e]);
	                  break;
	                case "STR":
	                  row[fieldName].push(data.columns[c].data.arr_col[r].data.str_col[e]);
	                  break;
	                case "TIME":
	                case "TIMESTAMP":
	                case "DATE":
	                  row[fieldName].push(data.columns[c].data.arr_col[r].data.int_col[e] * 1000);
	                  break;
	              }
	            }
	          } else {
	            switch (fieldType) {
	              case "BOOL":
	                row[fieldName] = data.columns[c].data.int_col[r] ? true : false;
	                break;
	              case "SMALLINT":
	              case "INT":
	              case "BIGINT":
	                row[fieldName] = data.columns[c].data.int_col[r];
	                break;
	              case "FLOAT":
	              case "DOUBLE":
	              case "DECIMAL":
	                row[fieldName] = data.columns[c].data.real_col[r];
	                break;
	              case "STR":
	                row[fieldName] = data.columns[c].data.str_col[r];
	                break;
	              case "TIME":
	              case "TIMESTAMP":
	              case "DATE":
	                row[fieldName] = new Date(data.columns[c].data.int_col[r] * 1000);
	                break;
	            }
	          }
	        }
	        formattedResult.results.push(row);
	      }
	      return formattedResult;
	    }
	  }, {
	    key: "processRowResults",
	    value: function processRowResults(data, eliminateNullRows) {
	      var numCols = data.row_desc.length;
	      var colNames = [];
	      var formattedResult = { fields: [], results: [] };

	      for (var c = 0; c < numCols; c++) {
	        var field = data.row_desc[c];
	        formattedResult.fields.push({
	          "name": field.col_name,
	          "type": datumEnum[field.col_type.type],
	          "is_array": field.col_type.is_array
	        });
	      }

	      formattedResult.results = [];
	      var numRows = 0;
	      if (data.rows !== undefined && data.rows !== null) {
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
	            continue;
	          }
	        }

	        var row = {};
	        for (var c = 0; c < numCols; c++) {
	          var fieldName = formattedResult.fields[c].name;
	          var fieldType = formattedResult.fields[c].type;
	          var fieldIsArray = formattedResult.fields[c].is_array;
	          if (fieldIsArray) {
	            if (data.rows[r].cols[c].is_null) {
	              row[fieldName] = "NULL";
	              continue;
	            }
	            row[fieldName] = [];
	            var arrayNumElems = data.rows[r].cols[c].val.arr_val.length;
	            for (var e = 0; e < arrayNumElems; e++) {
	              var elemDatum = data.rows[r].cols[c].val.arr_val[e];
	              if (elemDatum.is_null) {
	                row[fieldName].push("NULL");
	                continue;
	              }
	              switch (fieldType) {
	                case "BOOL":
	                  row[fieldName].push(elemDatum.val.int_val ? true : false);
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
	                  row[fieldName].push(elemDatum.val.int_val * 1000);
	                  break;
	              }
	            }
	          } else {
	            var scalarDatum = data.rows[r].cols[c];
	            if (scalarDatum.is_null) {
	              row[fieldName] = "NULL";
	              continue;
	            }
	            switch (fieldType) {
	              case "BOOL":
	                row[fieldName] = scalarDatum.val.int_val ? true : false;
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
	                row[fieldName] = new Date(scalarDatum.val.int_val * 1000);
	                break;
	            }
	          }
	        }
	        formattedResult.results.push(row);
	      }
	      return formattedResult;
	    }
	  }, {
	    key: "processResults",
	    value: function processResults(isImage, eliminateNullRows, query, callbacks, result) {
	      if (this._logging && result.execution_time_ms) console.log(query + ": " + result.execution_time_ms + " ms");
	      var hasCallback = typeof callbacks !== 'undefined';
	      if (isImage) {
	        if (hasCallback) {
	          callbacks.pop()(result, callbacks);
	        } else {
	          return result;
	        }
	      } else {
	        result = result.row_set;
	        var formattedResult = null;
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
	  }, {
	    key: "getDatabases",
	    value: function getDatabases() {
	      this.testConnection();
	      var databases = null;
	      try {
	        databases = this._client.get_databases();
	      } catch (err) {
	        if (err.name == "ThriftException") {
	          this.connect();
	          databases = this._client.get_databases();
	        }
	      }
	      var dbNames = [];
	      //TODO: Remove jquery, figure out what db_names is supposed to be
	      $(databases).each(function () {
	        dbNames.push(this.db_name);
	      });
	      return dbNames;
	    }
	  }, {
	    key: "getTables",
	    value: function getTables() {
	      this.testConnection();
	      var tabs = null;
	      try {
	        tabs = this._client.get_tables(this._sessionId);
	      } catch (err) {
	        if (err.name == "ThriftException") {
	          this.connect();
	          tabs = this._client.get_tables(this._sessionId);
	        }
	      }

	      var numTables = tabs.length;
	      var tableInfo = [];
	      for (var t = 0; t < numTables; t++) {
	        tableInfo.push({
	          "name": tabs[t],
	          "label": "obs"
	        });
	      }
	      return tableInfo;
	    }
	  }, {
	    key: "invertDatumTypes",
	    value: function invertDatumTypes() {
	      for (var key in TDatumType) {
	        this._datumEnum[TDatumType[key]] = key;
	      }
	    }
	  }, {
	    key: "getFields",
	    value: function getFields(tableName) {
	      this.testConnection();
	      var fields = this._client.get_table_descriptor(this._sessionId, tableName);
	      var fieldsArray = [];
	      // silly to change this from map to array
	      // - then later it turns back to map
	      for (var key in fields) {
	        fieldsArray.push({
	          "name": key,
	          "type": this._datumEnum[fields[key].col_type.type],
	          "is_array": fields[key].col_type.is_array,
	          "is_dict": fields[key].col_type.encoding == TEncodingType["DICT"]
	        });
	      }
	      return fieldsArray;
	    }
	  }, {
	    key: "createTable",
	    value: function createTable(tableName, rowDesc, callback) {
	      try {
	        result = this._client.send_create_table(this._sessionId, tableName, rowDesc, callback);
	      } catch (err) {
	        console.log(err);
	        if (err.name == "ThriftException") {
	          this.connect();
	          result = this._client.send_create_table(this._sessionId, tableName, rowDesc, callback);
	        }
	      }
	      return result;
	    }
	  }, {
	    key: "importTable",
	    value: function importTable(tableName, fileName, copyParams, callback) {
	      copyParams.delimiter = copyParams.delimiter || "";
	      try {
	        result = this._client.send_import_table(this._sessionId, tableName, fileName, copyParams, callback);
	      } catch (err) {
	        console.log(err);
	        if (err.name == "ThriftException") {
	          this.connect();
	          result = this._client.send_import_table(this._sessionId, tableName, fileName, copyParams, callback);
	        }
	      }
	      return result;
	    }
	  }, {
	    key: "importTableStatus",
	    value: function importTableStatus(importId, callback) {
	      this.testConnection();
	      callback = callback || null;
	      var import_status = null;
	      try {
	        import_status = this._client.import_table_status(this._sessionId, importId, callback);
	      } catch (err) {
	        console.log(err);
	        if (err.name == "ThriftException") {
	          this.connect();
	          import_status = this._client.import_table_status(this._sessionId, importId, callback);
	        }
	      }
	      return import_status;
	    }
	  }, {
	    key: "getRowsForPixels",
	    value: function getRowsForPixels(pixels, table_name, col_names, callbacks) {
	      var widget_id = 1; // INT
	      var column_format = true; //BOOL
	      callbacks = callbacks || null;
	      var curNonce = (this._nonce++).toString();
	      try {
	        if (!callbacks) {
	          return this.processPixelResults(undefined, this._client.get_rows_for_pixels(this._sessionId, widget_id, pixels, table_name, col_names, column_format, curNonce));
	        }
	        this._client.get_rows_for_pixels(this._sessionId, widget_id, pixels, table_name, col_names, column_format, curNonce, this.processPixelResults.bind(this, callbacks));
	      } catch (err) {
	        console.log(err);
	        if (err.name == "ThriftException") {
	          this.connect();
	          if (!callbacks) {
	            return this.processPixelResults(undefined, this._client.get_rows_for_pixels(this._sessionId, widget_id, pixels, table_name, col_names, column_format, curNonce));
	          }
	          this._client.get_rows_for_pixels(this._sessionId, widget_id, pixels, table_name, col_names, column_format, curNonce, this.processPixelResults.bind(this, callbacks));
	        }
	      }
	      return curNonce;
	    }
	  }, {
	    key: "processPixelResults",
	    value: function processPixelResults(callbacks, results) {
	      var results = results.pixel_rows;
	      var numPixels = results.length;
	      var resultsMap = {};
	      for (var p = 0; p < numPixels; p++) {
	        results[p].row_set = this.processResults(false, false, "pixel request", undefined, results[p]);
	      }
	      if (!callbacks) {
	        return results;
	      }
	      callbacks.pop()(results, callbacks);
	    }
	  }]);

	  return MapdCon;
	}();

	// Set a global mapdcon function when mapdcon is brought in via script tag.

	if (( false ? "undefined" : _typeof(module)) === "object" && module.exports) {
	  window.MapdCon = MapdCon;
	}

	exports.default = new MapdCon();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)(module)))

/***/ },
/* 1 */
/***/ function(module, exports) {

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


/***/ }
/******/ ]);