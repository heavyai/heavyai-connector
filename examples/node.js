/* eslint-disable no-console */

const Connector = require("../dist/node-connector.js")

// The total number of tweets from Columbia
const query = "SELECT count(*) AS n FROM tweets_nov_feb WHERE country='CO'"
const defaultQueryOptions = {}

const connector = new Connector()
connector
.protocol("https")
.host("metis.mapd.com")
.port("443")
.dbName("mapd")
.user("mapd")
.password("HyperInteractive")
.connect((connectError, session) => { // eslint-disable-line consistent-return
  if (connectError) { return console.error("Error connecting", connectError) }

  session.getTablesAsync()
  .then(data => console.log("All tables available at metis.mapd.com:", data.map(x => x.name)))
  .catch(error => console.error("getTablesAsync error:", error))

  session.query(query, defaultQueryOptions, (error, data) => {
    if (error) { return console.error("Query 1 error:", error) }
    return console.log("Query 1 results:", Number(data[0].n))
  })

  // List columns for table "flights_donotmodify"
  session.getFields("flights_donotmodify", (error, data) => {
    if (error) { return console.error("getFields error:", error) }
    return console.log("All fields for 'flights_donotmodify':", data.reduce((o, x) => Object.assign(o, {[x.name]: x}), {}))
  })

  // try changing airtime to arrdelay in the query
  const query2 = "SELECT carrier_name as key0, AVG(airtime) AS val FROM flights_donotmodify WHERE airtime IS NOT NULL GROUP BY key0 ORDER BY val DESC LIMIT 100"
  session.query(query2, defaultQueryOptions, (error, data) => {
    if (error) { return console.error("Query 2 error:", error) }
    return console.log("Query 2 results:", data.reduce((o, x) => Object.assign(o, {[x.key0]: x.val}), {}))
  })
})
