/*
 * For this module to resolve properly, the file tree must look like this:
 *
 * App/ 
 *   build/MapdConNode.js <-- import this in your application
 *   build/MapdConUtils.js <-- dependency of MapdConNode, must live in build directory
 *   dist/node/mapd.thrift.js <-- dependency of MapdConNode, must live in dist directory
 *   dist/node/mapd_types.js <-- dependency of MapdConNode, must live in dist directory
 *   dist/thrift.js <-- dependency of MapdConNode, must live in dist directory
 */
var MapdCon = require("./build/MapdConNode").MapdCon;

// Create an instance of MapdCon and set the connection parameters
var conAsync = new MapdCon()
  .protocol("http")
  .host("kali.mapd.com")
  .port("9092")
  .dbName("mapd")
  .user("mapd")
  .password("HyperInteractive");

// Connect to MapD. Has node-style callback.
conAsync.connect(function(err, sessionId){ 
  if (err) { console.error(err); return; }

  // NOTE: sessionId is set on conAsync upon a successful connection,
  //       however you also have access to it here in the callback.
  console.log("a true statement:", sessionId === conAsync.sessionId()[0]);

  var query = "SELECT count(*) AS n FROM flights";
  var options = {};

  // Perform a query and get the results in an array of callbacks.
  // NOTE: Does not have a node-style callback.
  conAsync.query(query, options, [function (result) {
    if (result instanceof Error) { console.error("Error:", result); } // error checking
    else { console.log("number of rows in table:", parseInt(result[0].n)); }
  }]);
});
