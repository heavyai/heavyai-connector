/* eslint-disable */

const Connector = require("../dist/node-connector.js")

// The total number of tweets from Columbia
const query = "SELECT count(*) AS n FROM tweets_nov_feb WHERE country='CO'"
const query2 =
  "SELECT carrier_name as key0, AVG(airtime) AS val FROM flights_donotmodify WHERE airtime IS NOT NULL GROUP BY key0 ORDER BY val DESC LIMIT 100"
const defaultQueryOptions = {}

const connector = new Connector()


connector
  .protocol("https")
  .host("metis.mapd.com")
  .port("443")
  .dbName("mapd")
  .user("mapd")
  .password("HyperInteractive")
  .connectAsync()
  .then(session =>
    // now that we have a session open we can make some db calls:
    Promise.all([
      session.getTablesAsync(),
      session.getFieldsAsync("flights_donotmodify"),
      session.queryAsync(query, defaultQueryOptions),
      session.queryAsync(query2, defaultQueryOptions)
    ])
  )
  // values is an array of results from all the promises above
  .then(values => {
    // handle result of getTablesAsync
    console.log(
      "All tables available at metis.mapd.com:\n\n",
      values[0].map(x => x.name)
    )

    // handle result of getFieldsAsync
    console.log(
      "\nAll fields for 'flights_donotmodify':\n\n",
      values[1].reduce((o, x) => Object.assign(o, { [x.name]: x }), {})
    )

    // handle result of first query
    console.log("\nQuery 1 results:\n\n", Number(values[2][0].n))

    // handle result of second query
    console.log(
      "\nQuery 2 results:\n\n",
      values[3].reduce((o, x) => Object.assign(o, { [x.key0]: x.val }), {})
    )
  })
  .catch(error => {
    console.error("Something bad happened: ", error)
  })
