(function(exports){
  dbcon.version = "1.0";
  exports.dbcon = dbcon;
  function dbcon() {
    var dbcon = {
      setPlatform: setPlatform,
      setHost: setHost,
      setUser: setUser,
      setDbName: setDbName,
      query: query
    }
    var platform = "postgres";
    var host = "localhost"; // default
    var user = null;
    var dbName = null;

    function setPlatform(newPlatform) {
      platform = newPlatofrm;
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

    function query(query) {
      if (host == null) {
        throw "Host not defined";
      }
      if (user == null) {
        throw "User not defined";
      }
      if (dbName == null) {
        throw "Db name not defined";
      }

      var requestString = platform + ".php?host=" + host + "&user=" + user + "&dbname=" + dbName + "&q=" +  query;
      return JSON.parse($.ajax({type: "GET", url: requestString, async: false}).responseText);
    }
    return dbcon;
  }
})(typeof exports !== 'undefined' && exports || this);
