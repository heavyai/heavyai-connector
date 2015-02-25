(function(exports){
  dbcon.version = "1.0";
  exports.dbcon = dbcon;
  function dbcon() {
    var dbcon = {
      setPlatform: setPlatform,
      getPlatform: function () {return platform;},
      setHost: setHost,
      setUser: setUser,
      setDbName: setDbName,
      query: query,
      getFields: getFields,
      getDatabases: getDatabases,
      getTablesForDb: getTablesForDb
  
      //getMetadata: getMetadata
    }
    var platform = "mapd";
    var host = "localhost"; // default
    var user = null;
    var dbName = "mapd";

    function setPlatform(newPlatform) {
      platform = newPlatform;
      return dbcon;
    }

    function setHost (newHost) {
      host = newHost;
      return dbcon;
    }

    function setUser (newUser) {
      user = newUser;
      return dbcon;
    }

    function setDbName (newDb) {
      dbName = newDb;
      return dbcon;
    }

    function testParamsDefined() {
      if (host == null) {
        throw "Host not defined";
      }
      if (user == null) {
        throw "User not defined";
      }
      if (dbName == null) {
        throw "Db name not defined";
      }
    }

    function processResponse(response) {
      var fields = response.fields;
      // need to check for dates
      var dateVars = [];
      //var valueVars = []; // value vars are attributes prefixed by value_ -> need to put these in value struct
      var numFields = fields.length;
      for (var i = 0; i < numFields; i++) {
        //console.log("type = " + fields[i].type);
        if (fields[i].type == "date" || fields[i].type == "timestamp" || fields[i].type == "timestamptz" || fields[i].type == "TIME")  {
          dateVars.push(fields[i].name);
        }
      }
      var numDateVars = dateVars.length;
      if (numDateVars > 0) {
        var numRows = response.results.length;
        for (var r = 0; r < numRows; r++) { 
          for (var d = 0; d < numDateVars; d++) {
            response.results[r][dateVars[d]] = new Date(response.results[r][dateVars[d]]);

          }
        }
      }
    }

    function query(query) {
      testParamsDefined();
      console.log(query);
      var requestString = platform + ".php?zip=1&host=" + host + "&user=" + user + "&dbname=" + dbName + "&q=" +  query + ";";
      var response = JSON.parse($.ajax({type: "GET", url: requestString, async: false}).responseText);
      console.log(response);
      processResponse(response);
      return response.results;
    }

    function queryAsync(query,callback) {
      testParamsDefined();
      var requestString = platform + ".php?zip=1&host=" + host + "&user=" + user + "&dbname=" + dbName + "&q=" +  query;
      $.getJSON(requestString, function(response) {
        processResponse(response);
        callback(response.results);
      });
    }

    function getDatabases () {
      testParamsDefined();
      var requestString = platform + ".php?host=" + host + "&user=" + user + "&dbname=" + dbName + "&meta=dbs";
      return JSON.parse($.ajax({type: "GET", url: requestString, async: false}).responseText);
    }
    function getTablesForDb () {
      testParamsDefined();
      var requestString = platform + ".php?host=" + host + "&user=" + user + "&dbname=" + dbName + "&meta=tables";
      return JSON.parse($.ajax({type: "GET", url: requestString, async: false}).responseText);
    }

    /* 
    function getMetadata(tableName) {
      console.log("hi");
      testParamsDefined();
      var requestString = platform + ".php?host=" + host + "&user=" + user + "&dbname=" + dbName + "&meta=1";
      if (tableName) {
        requestString += "&table=" + tableName;
      }
      return JSON.parse($.ajax({type: "GET", url: requestString, async: false}).responseText);
    }
    */

    function getFields(tableName) { 
      testParamsDefined();
      var requestString = platform + ".php?host=" + host + "&user=" + user + "&dbname=" + dbName + "&table=" + tableName + "&meta=fields";
      return JSON.parse($.ajax({type: "GET", url: requestString, async: false}).responseText);
      /*
      var query = "SELECT * FROM " + tableName + " LIMIT 0";
      var requestString = platform + ".php?host=" + host + "&user=" + user + "&dbname=" + dbName + "&q=" +  query;
      return JSON.parse($.ajax({type: "GET", url: requestString, async: false}).responseText).fields;
      */
    }

    return dbcon;
  }
})(typeof exports !== 'undefined' && exports || this);
