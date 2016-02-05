import { readFileSync } from 'fs';

export const connect = (con, callback) => {
  con
    .protocol('http')
    .host('kali.mapd.com')
    .port('9092')
    .dbName('mapd')
    .user('mapd')
    .password('HyperInteractive');
  return callback ? con.connect(callback) : con.connect();
};

export const loadScripts = () => {
  const thrift = readFileSync('./dist/thrift.js', 'utf-8');
  const mapdthrift = readFileSync('./dist/mapd.thrift.js', 'utf-8');
  const mapdtypes = readFileSync('./dist/mapd_types.js', 'utf-8');
  const mapdcon = readFileSync('./dist/MapdCon.js', 'utf-8');
  return [thrift, mapdthrift, mapdtypes, mapdcon];
};
