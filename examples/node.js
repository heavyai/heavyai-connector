/* eslint-disable */

const Connector = require("../dist/node-connector.js")

const hostname = process.env.HOSTNAME || "metis.mapd.com"
const protocol = process.env.PROTOCOL || "https"
const port = process.env.PORT || "443"
const database = process.env.DATABASE || "mapd"
const username = process.env.USERNAME || "mapd"
const password = process.env.PASSWORD || "HyperInteractive"

// The total number of tweets from Columbia
const query = "SELECT count(*) AS n FROM tweets_nov_feb WHERE country='CO'"
const query2 =
  "SELECT carrier_name as key0, AVG(airtime) AS val FROM flights_donotmodify WHERE airtime IS NOT NULL GROUP BY key0 ORDER BY val DESC LIMIT 100"
const defaultQueryOptions = {}

const connector = new Connector()

connector
  .protocol(protocol)
  .host(hostname)
  .port(port)
  .dbName(database)
  .user(username)
  .password(password)
  .connectAsync()
  .then((session) =>
    // now that we have a session open we can make some db calls:
    Promise.all([
      session.getDashboardsAsync(),
      session.getTablesAsync(),
      session.getFieldsAsync("flights_donotmodify"),
      session.queryAsync(query, defaultQueryOptions),
      session.queryAsync(query2, defaultQueryOptions)
    ])
  )
  // values is an array of results from all the promises above
  .then((values) => {
    // handle result of getDashboardsAsync
    console.log(
      `All dashboards available at ${hostname}:\n`,
      values[0].map((dash) => dash.dashboard_name)
    )

    // handle result of getTablesAsync
    console.log(
      `\nAll tables available at ${hostname}:\n\n`,
      values[1].map((x) => x.name)
    )

    // handle result of getFieldsAsync
    console.log(
      "\nAll fields for 'flights_donotmodify':\n\n",
      values[2].columns.reduce((o, x) => Object.assign(o, { [x.name]: x }), {})
    )

    // handle result of first query
    console.log("\nQuery 1 results:\n\n", Number(values[3][0].n))

    // handle result of second query
    console.log(
      "\nQuery 2 results:\n\n",
      values[4].reduce((o, x) => Object.assign(o, { [x.key0]: x.val }), {})
    )
  })
  .catch((error) => {
    console.error("Something bad happened: ", error)
  })
