console.log(MapdCon)

const connector = new MapdCon()
  .protocol("https")
  .host("13e3b838065e.ngrok.io")
  .port("443")
  .dbName("omnisci")
  .user("admin")
  .password("HyperInteractive")

connector.connect((err, session) => {
  console.error(err)
  console.log(session)
  session
    .queryAsync(`SELECT * FROM flights_donotmodify LIMIT 10`)
    .then(
      (res) => {
        console.log(res)
      },
      (err) => {
        console.error(err)
      }
    )
    .catch((err) => {
      console.error(err)
    })
  session.queryDFAsync(`SELECT * FROM flights_donotmodify LIMIT 10 `).then((res) => {
      console.log(res)
      console.log(res.toArray())
  })
})

console.log(connector)