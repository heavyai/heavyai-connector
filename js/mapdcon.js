(function(exports){
  mapdcon.version= "1.0";
  exports.mapdcon = mapdcon;

  function mapdcon() {
    var mapdcon = {
      setPlatform: setPlatform,
      setHost: setHost,
      setUser: setUser,
      setPort: setPort,
      setDbName: setDbName,
      connect: connect,
      query: query,
      getDatabases: getDatabases,
      getTablesForDb: getTablesForDb,
      getFields: getFields,
      getPlatform: getPlatform
    }
  
    var host = "localhost";
    var user = "mapd";
    var port = "9090";
    var dbname = null;
    var transport = null;
    var protocol = null;
    var client = null;
    var datumEnum = {};

    function setPlatform(newPlatform) {
      //dummy function for now
      return mapdcon;
    }

    function getPlatform() {
      return "mapd";
    }

    function setHost(newHost) {
      host = newHost;
      return mapdcon;
    }

    function setUser (newUser) {
      user = newUser;
      return mapdcon;
    }

    function setPort (newPort) {
      port = newPort;
      return mapdcon;
    }

    function setDbName (newDb) {
      dbName = newDb;
      return mapdcon;
    }

    function testConnection() {
      if (client == null)  {
        throw "Client not connected";
      }
    }

    function connect() {
      transport = new Thrift.Transport("http://" + host + ":" + port);
      protocol = new Thrift.Protocol(transport);
      client = new MapDClient(protocol);
      return mapdcon
    }

    function query(query) {
      testConnection();
      var result = client.select(query + ";");
      var formattedResult = {};
      formattedResult.fields = [];
      var numCols = result.proj_info.length;
      for (var c = 0; c < numCols; c++) {
        var field = result.proj_info[c]; 
        formattedResult.fields.push({"name": field.proj_name, "type": datumEnum[field.proj_type.type});
      }




      return result.rows;
    }

    function getDatabases () {
      testConnection();
      return ["mapd"];
    }

    function getTablesForDb() {
      testConnection();
      var tabs = client.getTables();
      var numTables = tabs.length;
      var tableInfo = [];
      for (var t = 0; t < numTables; t++) {
        tableInfo.push({"name": tabs[t], "label": "flights"});
      }
      return tableInfo; 
    }

    function invertDatumTypes() {
      for (key in TDatumType) {
        datumEnum[TDatumType[key]] = key;
      }
    }

    function getFields(tableName) {
      testConnection();
      var fields = client.getColumnTypes(tableName);
      var fieldsArray = [];
      // silly to change this from map to array 
      // - then later it turns back to map
      for (key in fields) {
        fieldsArray.push({"name": key, "type": datumEnum[fields[key].type]});
      }
      return fieldsArray;
    }
    invertDatumTypes();
    return mapdcon;
  }

})(typeof exports !== 'undefined' && exports || this);
