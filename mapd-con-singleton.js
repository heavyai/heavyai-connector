class MapdCon {
  constructor(){
    this.version= "1.0";
    this.host = null;
    this.user = null;
    this.password = null; // to be changed
    this.port = null;
    this.dbName = null;
    this.transport = null;
    this.protocol = null;
    this.client = null;
    this.sessionId = null;
    this.datumEnum = {};
  }

  setPlatform(newPlatform) {
    return this;
  }

  getPlatform() {
    return "mapd";
  }
  getClient() {
    return this.client;
  }

  setHost(newHost) {
    this.host = newHost;
    return this;
  }

  getHost(){
    console.log(this.host);
  }

  setUserAndPassword (newUser,newPassword) {
    this.user = newUser;
    this.password = newPassword;
    return this;
  }

  setPort (newPort) {
    this.port = newPort;
    return this;
  }

  setDbName (newDb) {
    this.dbName = newDb;
    return this;
  }

  testConnection() {
    if (this.sessionId == null)  {
      return false;
      //throw "this.client not connected";
    }
    return true;
  }

  connect() {
    this.transport = new Thrift.Transport("http://" + this.host + ":" + this.port);
    this.protocol = new Thrift.Protocol(this.transport);
    this.client = new MapDClient(this.protocol);
    this.sessionId = this.client.connect(this.user, this.password, this.dbName);
    return this;
  }

  disconnect() {
    if (this.sessionId != null) {
      this.client.disconnect(this.sessionId);
      this.sessionId = null;
    }
    this.client = null;
    this.protocol = null;
    this.transport = null;
  }

  getFrontendViews() {
    var result = null;
    try {
      result = this.client.get_frontend_views(this.sessionId);
    }
    catch(err) {
      console.log(err);
      if (err.name == "ThriftException") {
        this.connect();
        result = this.client.get_frontend_views(this.sessionId);
      }
    }
    return result;
  }

  getFrontendView(viewName) {
    var result = null;
    try {
      result = this.client.get_frontend_view(this.sessionId,viewName);
    }
    catch(err) {
      console.log(err);
      if (err.name == "ThriftException") {
        this.connect();
        result = this.client.get_frontend_views(this.sessionId,viewName);
      }
    }
    return result;
  }

  getServerStatus() {
    var result = null;
    try {
      result = this.client.get_server_status();
    }
    catch(err) {
      console.log(err);
      if (err.name == "ThriftException") {
        this.connect();
        result = this.client.get_server_status();
      }
    }
    return result;
  }


  createFrontendView(viewName, viewState, imageHash) {
    try {
      this.client.create_frontend_view(this.sessionId, viewName, viewState, imageHash);
    }
    catch(err) {
      console.log(err);
      if (err.name == "ThriftException") {
        this.connect();
        result = this.client.get_frontend_views(this.sessionId, viewName, viewState, imageHash);
      }
    }
  }

  createLink(viewState) {
    try {
      result = this.client.create_link(this.sessionId, viewState);
    }
    catch(err) {
      console.log(err);
      if (err.name == "ThriftException") {
        this.connect();
        result = this.client.create_link(this.sessionId, viewState);
      }
    }
    return result;
  }

  getLinkView(link) {
    try {
      result = this.client.get_link_view(this.sessionId, link);
    }
    catch(err) {
      console.log(err);
      if (err.name == "ThriftException") {
        this.connect();
        result = this.client.get_link_view(this.sessionId, link);
      }
    }
    return result;
  }

  detectColumnTypes(fileName, copyParams, callback) {
    copyParams.delimiter = copyParams.delimiter || "";
    try {
      result = this.client.detect_column_types(this.sessionId, fileName, copyParams, callback);
    }
    catch(err) {
      console.log(err);
      if (err.name == "ThriftException") {
        this.connect();
        result = this.client.detect_column_types(this.sessionId, fileName, copyParams, callback);
      }
    }
    return result;
  }


  queryAsync(query, columnarResults, eliminateNullRows, callbacks) {
    columnarResults = columnarResults === undefined ? true : columnarResults; // make columnar results default if not specified 
    try {
      this.client.sql_execute(this.sessionId,query + ";", columnarResults, this.processResults.bind(this,eliminateNullRows,callbacks));
    }
    catch(err) {
      console.log(err);
      if (err.name == "ThriftException") {
        this.connect();
        this.client.sql_execute(this.sessionId,query + ";", columnarResults, this.processResults.bind(this,callbacks));
      }
      else if (err.name == "TMapDException") {
        // swal({title: "Error!",   
        //   text: err.error_msg,   
        //   type: "error",   
        //   confirmButtonText: "Okay" 
        // });
        console.log(err.error_msg);
      }
      else {
        throw(err);
      }
    }
  }

  query(query,columnarResults,eliminateNullRows) {
    columnarResults = columnarResults === undefined ? true : columnarResults; // make columnar results default if not specified
    var result = null;
    try {
      result = this.client.sql_execute(this.sessionId,query + ";",columnarResults);
    }
    catch(err) {
      console.log(err);
      if (err.name == "ThriftException") {
        this.connect();
        result = this.client.sql_execute(this.sessionId,query + ";",columnarResults);
      }
      else if (err.name == "TMapDException") {
        // swal({title: "Error!",   
        //   text: err.error_msg,   
        //   type: "error",   
        //   confirmButtonText: "Okay" 
        // });
        console.log(err.error_msg);
      }
      else {
        throw(err);
      }
    }
    return this.processResults(eliminateNullRows, undefined, result); // undefined is callbacks slot
  }

  processColumnarResults(data,eliminateNullRows) {
    var formattedResult = {fields: [], results: []};
    var numCols = data.row_desc.length;
    var numRows = 0;
    for (var c = 0; c < numCols; c++) {
      var field = data.row_desc[c]; 
      formattedResult.fields.push({"name": field.col_name, "type": this.datumEnum[field.col_type.type], "is_array":field.col_type.is_array});
    }
    if (numCols > 0) 
      numRows = data.columns[0] !== undefined ? data.columns[0].nulls.length : 0;
    for (var r = 0; r < numRows; r++) {
      if (eliminateNullRows) {
        var rowHasNull = false;
        for (var c = 0; c < numCols; c++) {
          if (data.columns[c].nulls[r]) {
            rowHasNull = true;
            break;
          }
        }
        if (rowHasNull) 
          continue;
      }
      var row = {};
      for (var c = 0; c < numCols; c++) {
        var fieldName = formattedResult.fields[c].name;
        var fieldType = formattedResult.fields[c].type;
        var fieldIsArray = formattedResult.fields[c].is_array;
        var isNull = data.columns[c].nulls[r];
        if (isNull) {
          row[fieldName] = "NULL";
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
    var formattedResult = {fields: [], results: []};
    for (var c = 0; c < numCols; c++) {
      var field = data.row_desc[c]; 
      formattedResult.fields.push({"name": field.col_name, "type": this.datumEnum[field.col_type.type], "is_array":field.col_type.is_array});
    }
    formattedResult.results = [];
    var numRows = 0;
    if (data.rows !== undefined && data.rows !== null)
      numRows = data.rows.length; // so won't throw if data.rows is missing
    for (var r = 0; r < numRows; r++) {
      if (eliminateNullRows) {
        var rowHasNull = false;
        for (var c = 0; c < numCols; c++) {
          if (data.rows[r].columns[c].is_null) {
            rowHasNull = true;
            break;
          }
        }
        if (rowHasNull) 
          continue;
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

  processResults(eliminateNullRows,callbacks, result) {
    var hasCallback = typeof callbacks !== 'undefined';
    result = result.row_set;
    var formattedResult = null;
    if (result.is_columnar) {
      formattedResult = this.processColumnarResults(result,eliminateNullRows);
    }
    else {
      formattedResult = this.processRowResults(result,eliminateNullRows);
    }
    if (hasCallback) {
      callbacks.pop()(formattedResult.results,callbacks);
    }
    else {
      return formattedResult.results;
    }
  }

  getDatabases () {
    this.testConnection();
    var databases = null;
    try {
      databases = this.client.get_databases();
    }
    catch (err) {
      if (err.name === "ThriftException") {
        this.connect();
        databases = this.client.get_databases();
      }
    }
    var dbNames = [];
    databases.forEach(() => {
      dbNames.push(this.db_name);
    });
    return dbNames;
  }

  getTables() {
    this.testConnection();
    var tabs = null;
    try {
      tabs = this.client.get_tables(this.sessionId);
    }
    catch (err) {
      if (err.name == "ThriftException") {
        this.connect();
        tabs = this.client.get_tables(this.sessionId);
      }
    }

    var numTables = tabs.length;
    var tableInfo = [];
    for (var t = 0; t < numTables; t++) {
      tableInfo.push({"name": tabs[t], "label": "obs"});
    }
    return tableInfo; 
  }

  invertDatumTypes() {
    for (var key in TDatumType) {
      this.datumEnum[TDatumType[key]] = key;
    }
  }

  getFields(tableName) {
    this.testConnection();
    var fields = this.client.get_table_descriptor(this.sessionId,tableName);
    var fieldsArray = [];
    // silly to change this from map to array 
    // - then later it turns back to map
    for (var key in fields) {
      fieldsArray.push({"name": key, "type": this.datumEnum[fields[key].col_type.type], "is_array":fields[key].col_type.is_array, "is_dict": fields[key].col_type.encoding == TEncodingType["DICT"]});
    }
    return fieldsArray;
  }

  createTable(tableName, rowDesc, callback) {
    try {
      result = this.client.send_create_table(this.sessionId, tableName, rowDesc, callback);
    }
    catch(err) {
      console.log(err);
      if (err.name == "ThriftException") {
        this.connect();
        result = this.client.send_create_table(this.sessionId, tableName, rowDesc, callback);
      }
    }
    return result;
  }

  importTable(tableName, fileName, copyParams, callback) {
    copyParams.delimiter = copyParams.delimiter || "";
    try {
      result = this.client.send_import_table(this.sessionId, tableName, fileName, copyParams, callback);
    }
    catch(err) {
      console.log(err);
      if (err.name == "ThriftException") {
        this.connect();
        result = this.client.send_import_table(this.sessionId, tableName, fileName, copyParams, callback);
      }
    }
    return result;
  }

  importTableStatus(importId, callback) {
    this.testConnection();
    callback = callback || null;
    var import_status = null;
    try {
      import_status = this.client.import_table_status(this.sessionId, importId, callback);
    }
    catch(err) {
      console.log(err);
      if (err.name == "ThriftException") {
        this.connect();
        import_status = this.client.import_table_status(this.sessionId, importId, callback);
      }
    }
    return import_status;
  }

}

// Set a global mapdcon instance when mapdcon is brought in via script tag.
if(typeof module === "object" && module.exports){
  window.mapdcon = new MapdCon();
}

export default new MapdCon();

