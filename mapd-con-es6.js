  class MapdCon {
    constructor(){

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

    getSessionId() {
      return this._sessionId;
    }

    getHost() {
      return this._host;
    }

    getPort() {
      return this._port;
    }

    getUser() {
      return this._user
    }

    getDb() {
      return this._dbName
    }

    getUploadServer() {
      return ""; // empty string: same as frontend server
    }

    /**
     * Set or get the logging flag
     * @param {Boolean} _
     */
    logging(_) {
      if (!arguments.length){
        return this._logging;
      }
      this._logging = _;
      return this;
    }

    setPlatform(newPlatform) {
      //dummy function for now
      return this;
    }
    getPlatform() {
      return "mapd";
    }

    getClient() {
      return this._client;
    }

    setHost(newHost) {
      this._host = newHost;
      return this;
    }

    setUserAndPassword(newUser, newPassword) {
      this._user = newUser;
      this._password = newPassword;
      return this;
    }

    setPort(newPort) {
      this._port = newPort;
      return this;
    }

    setDbName (newDb) {
      this._dbName = newDb;
      return this;
    }

    testConnection() {
      if (this._sessionId === null)  {
        return false;
        //throw "Client not connected";
      }
      return true;
    }

    connect() {
      let transportUrl = "http://" + this._host + ":" + this._port;
      this._transport = new Thrift.Transport(transportUrl);
      this._protocol = new Thrift.Protocol(this._transport);
      this._client = new MapDClient(this._protocol);
      this._sessionId = this._client.connect(this._user, this._password, this._dbName);
      return this;
    }

    disconnect() {
      if (this._sessionId !== null) {
        this._client.disconnect(this._sessionId);
        this._sessionId = null;
      }
      this._client = null;
      this._protocol = null;
      this._transport = null;
    }

    getFrontendViews() {
      var result = null;
      try {
        result = this._client.get_frontend_views(this._sessionId);
      }
      catch(err) {
        console.log(err);
        if (err.name == "ThriftException") {
          this.connect();
          result = this._client.get_frontend_views(this._sessionId);
        }
      }
      return result;
    }

    getFrontendView(viewName) {
      var result = null;
      try {
        result = this._client.get_frontend_view(this._sessionId, viewName);
      }
      catch(err) {
        console.log(err);
        if (err.name === "ThriftException") {
          this.connect();
          result = this._client.get_frontend_views(this._sessionId, viewName);
        }
      }
      return result;
    }

    getServerStatus() {
      var result = null;
      try {
        result = this._client.get_server_status();
      }
      catch(err) {
        console.log(err);
        if (err.name == "ThriftException") {
          this.connect();
          result = this._client.get_server_status();
        }
      }
      return result;
    }

    createFrontendView(viewName, viewState, imageHash) {
      try {
        this._client.create_frontend_view(this._sessionId, viewName, viewState, imageHash);
      }
      catch(err) {
        console.log(err);
        if (err.name == "ThriftException") {
          this.connect();
          var result = this._client.get_frontend_views(this._sessionId, viewName, viewState, imageHash);
        }
      }
    }

    createLink(viewState) {
      try {
        result = this._client.create_link(this._sessionId, viewState);
      }
      catch(err) {
        console.log(err);
        if (err.name == "ThriftException") {
          this.connect();
          result = this._client.create_link(this._sessionId, viewState);
        }
      }
      return result;
    }

    getLinkView(link) {
      try {
        result = this._client.get_link_view(this._sessionId, link);
      }
      catch(err) {
        console.log(err);
        if (err.name == "ThriftException") {
          this.connect();
          result = this._client.get_link_view(sessionId, link);
        }
      }
      return result;
    }

    detectColumnTypes(fileName, copyParams, callback) {
      var result = null;
      copyParams.delimiter = copyParams.delimiter || "";
      try {
        result = this._client.detect_column_types(this._sessionId, fileName, copyParams, callback);
      }
      catch(err) {
        console.log(err);
        if (err.name == "ThriftException") {
          this.connect();
          result = this._client.detect_column_types(this._sessionId, fileName, copyParams, callback);
        }
      }
      return result;
    }

    queryAsync(query, columnarResults, eliminateNullRows, renderSpec, callbacks) {
      columnarResults = columnarResults === undefined ? true : columnarResults; // make columnar results default if not specified
      var curNonce = (this._nonce++).toString();
      try {
        if (renderSpec !== undefined) {
          let processResults = this.processResults.bind(this, true, eliminateNullRows, "render: " + query, callbacks);
          this._client.render( this._sessionId, query + ";", renderSpec, {}, {}, curNonce, processResults);
        }
        else {
          let processResults = this.processResults.bind(this, false, eliminateNullRows, query, callbacks);
          this._client.sql_execute(this._sessionId, query + ";", columnarResults, curNonce, processResults);
        }
      }
      catch(err) {
        console.log(err);
        if (err.name == "ThriftException") {
          let processResults = processResults.bind(this, false, eliminateNullRows, query, callbacks);
          this.connect();
          this._client.sql_execute(this._sessionId, query + ";", columnarResults, curNonce, processResults);
        }
        else if (err.name == "TMapDException") {
          swal({title: "Error!",
            text: err.error_msg,
            type: "error",
            confirmButtonText: "Okay"
          });

          // google analytics send error
          ga('send', 'event', 'error', 'async query error', err.error_msg, {
           nonInteraction: true
          });

        }
        else {
          throw(err);
        }
      }
      return curNonce;
    }

    query(query, columnarResults, eliminateNullRows, renderSpec) {
      columnarResults = columnarResults === undefined ? true : columnarResults; // make columnar results default if not specified
      var result = null;
      var curNonce = (this._nonce++).toString();
      try {
        if (renderSpec !== undefined) {
          result = this._client.render(this._sessionId, query + ";", renderSpec, {}, {}, curNonce);
        }
        else {
          result = this._client.sql_execute(this._sessionId, query + ";", columnarResults, curNonce);
        }
      }
      catch(err) {
        console.log(err);
        if (err.name == "ThriftException") {
          this.connect();
          result = this._client.sql_execute(this._sessionId, query + ";", columnarResults, curNonce);
        }
        else if (err.name == "TMapDException") {
          swal({title: "Error!",
            text: err.error_msg,
            type: "error",
            confirmButtonText: "Okay"
          });

          // google analytics send error
          ga('send', 'event', 'error', 'query error', err.error_msg, {
           nonInteraction: true
          })
        }
        else {
          throw(err);
        }
      }

      if (renderSpec !== undefined){
        return result;
      }
      query = renderSpec ? "render: " + query : query;
      return this.processResults(false, eliminateNullRows, query, undefined, result); // undefined is callbacks slot
    }

    processColumnarResults(data, eliminateNullRows) {
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
      
      if (numCols > 0){
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
          if (rowHasNull){
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
              switch(fieldType) {
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
          }
          else {
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

    processRowResults(data, eliminateNullRows) {
      var numCols = data.row_desc.length;
      var colNames = [];
      var formattedResult = { fields: [], results: [] };

      for (var c = 0; c < numCols; c++) {
        var field = data.row_desc[c];
        formattedResult.fields.push({
          "name": field.col_name,
          "type": datumEnum[field.col_type.type],
          "is_array":field.col_type.is_array
        });
      }

      formattedResult.results = [];
      var numRows = 0;
      if (data.rows !== undefined && data.rows !== null){
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
          if (rowHasNull){
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
              switch(fieldType) {
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
          }
          else {
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

    processResults(isImage, eliminateNullRows, query, callbacks, result) {
      if (this._logging && result.execution_time_ms)
        console.log(query + ": " + result.execution_time_ms + " ms");
      var hasCallback = typeof callbacks !== 'undefined';
      if (isImage) {
        if (hasCallback) {
          callbacks.pop()(result, callbacks);
        }
        else {
          return result;
        }
      }
      else {
        result = result.row_set;
        var formattedResult = null;
        if (result.is_columnar) {
          formattedResult = this.processColumnarResults(result, eliminateNullRows);
        }
        else {
          formattedResult = this.processRowResults(result, eliminateNullRows);
        }
        if (hasCallback) {
          callbacks.pop()(formattedResult.results, callbacks);
        }
        else {
          return formattedResult.results;
        }
      }
    }

    getDatabases() {
      this.testConnection();
      var databases = null;
      try {
        databases = this._client.get_databases();
      }
      catch (err) {
        if (err.name == "ThriftException") {
          this.connect();
          databases = this._client.get_databases();
        }
      }
      var dbNames = [];
      //TODO: Remove jquery, figure out what db_names is supposed to be
      $(databases).each(function(){dbNames.push(this.db_name)});
      return dbNames;
    }

    getTables() {
      this.testConnection();
      var tabs = null;
      try {
        tabs = this._client.get_tables(this._sessionId);
      }
      catch (err) {
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

    invertDatumTypes() {
      for (var key in TDatumType) {
        this._datumEnum[TDatumType[key]] = key;
      }
    }

    getFields(tableName) {
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

    createTable(tableName, rowDesc, callback) {
      try {
        result = this._client.send_create_table(this._sessionId, tableName, rowDesc, callback);
      }
      catch(err) {
        console.log(err);
        if (err.name == "ThriftException") {
          this.connect();
          result = this._client.send_create_table(this._sessionId, tableName, rowDesc, callback);
        }
      }
      return result;
    }

    importTable(tableName, fileName, copyParams, callback) {
      copyParams.delimiter = copyParams.delimiter || "";
      try {
        result = this._client.send_import_table(this._sessionId, tableName, fileName, copyParams, callback);
      }
      catch(err) {
        console.log(err);
        if (err.name == "ThriftException") {
          this.connect();
          result = this._client.send_import_table(this._sessionId, tableName, fileName, copyParams, callback);
        }
      }
      return result;
    }

    importTableStatus(importId, callback) {
      this.testConnection();
      callback = callback || null;
      var import_status = null;
      try {
        import_status = this._client.import_table_status(this._sessionId, importId, callback);
      }
      catch(err) {
        console.log(err);
        if (err.name == "ThriftException") {
          this.connect();
          import_status = this._client.import_table_status(this._sessionId, importId, callback);
        }
      }
      return import_status;
    }

    getRowsForPixels(pixels, table_name, col_names, callbacks) {
      var widget_id = 1;  // INT
      var column_format = true; //BOOL
      callbacks = callbacks || null;
      var curNonce = (this._nonce++).toString();
      try {
        if (!callbacks){
            return this.processPixelResults(undefined, this._client.get_rows_for_pixels(this._sessionId, widget_id, pixels, table_name, col_names, column_format, curNonce)) ;
        }
        this._client.get_rows_for_pixels(this._sessionId, widget_id, pixels, table_name, col_names, column_format, curNonce, this.processPixelResults.bind(this, callbacks));
      }
      catch(err) {
        console.log(err);
        if (err.name == "ThriftException") {
          this.connect();
          if (!callbacks){
            return this.processPixelResults(undefined, this._client.get_rows_for_pixels(this._sessionId, widget_id, pixels, table_name, col_names, column_format, curNonce)) ;
          }
          this._client.get_rows_for_pixels(this._sessionId, widget_id, pixels, table_name, col_names, column_format, curNonce, this.processPixelResults.bind(this, callbacks));
        }
      }
      return curNonce;
    }

    processPixelResults(callbacks, results) {
      var results = results.pixel_rows;
      var numPixels = results.length;
      var resultsMap = {};
      for (var p = 0; p < numPixels; p++) {
        results[p].row_set = this.processResults(false, false, "pixel request", undefined, results[p]);
      }
      if (!callbacks){
        return results;
      }
      callbacks.pop()(results, callbacks);
    }

  }

// Set a global mapdcon function when mapdcon is brought in via script tag.
if(typeof module === "object" && module.exports){
  window.mapdcon = MapdCon;
}

export default new MapdCon();

