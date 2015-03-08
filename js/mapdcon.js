(function(exports){
  mapdcon.version= "1.0";
  exports.mapdcon = mapdcon;

  function mapdcon() {
    var mapdcon = {
      setHost: setHost,
      setUser: setUser,
      setPort: setPort,
      connect: connect,
      query: query,
      getDatabases,
      getTablesForDb,
      
    }
  
    var host = "localhost";
    var user = "mapd";
    var port = "9090";
    var transport = null;
    var protocol = null;
    var client = null;

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

    function testConnection() {
      if (client == null) 
        throw "Client not connected";
    }

    function connect() {
      transport = new Thrift.Transport("http://" + host + ":" + port);
      protocol = new Thrift.Protocol(transport);
      client = new MapDClient(protocol);
    }

    function query(query) {
      testConnection();
      var result = client.query(query);
      return response.rows;
    }

    function getDatabases () {
      testConnection();
      return ["mapd"];
    }

    function getTablesForDb() {
      testConnection();
      return client.getTables();
    }

    function getFields(tableName) {
      testConnection();
      return client.getColumnTypes(tableName);
    }

    return mapdcon;
  }

})(typeof exports !== 'undefined' && exports || this);
