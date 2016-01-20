let connect = (con) => {
  return con
    .host('athena.mapd.com')
    .port('8100')
    .dbName('mapd')
    .user('mapd')
    .password('HyperInteractive')
    .connect();
}

module.exports = { connect }

