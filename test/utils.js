const connect = (con) => {
  return con
    .host('kali.mapd.com')
    .port('9092')
    .dbName('mapd')
    .user('mapd')
    .password('HyperInteractive')
    .connect();
};
module.exports = { connect };
