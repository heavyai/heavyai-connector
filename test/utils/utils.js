import needle from 'needle';
import { jsdom } from 'jsdom';
import { readFileSync } from 'fs';
import { html, uploadUrl, deleteUploadUrl } from '../mocks/mocks-transpiled';

/**
 * cb takes the signature (done, window) => {}
 */
export const browserTest = (cb) => (
  (done) => {
    jsdom.env({
      html,
      src: loadScripts(),
      done: (err, window) => { cb(done, window); }
    });
  }
);

export const connect = (con, callback) => {
  con
    .protocol(process.env.PROTOCOL)
    .host(process.env.HOST)
    .port(process.env.PORT)
    .dbName(process.env.DB_NAME)
    .user(process.env.USER)
    .password(process.env.PASSWORD);
  return callback ? con.connect(callback) : con.connect();
};

export const loadScripts = () => {
  const thrift = readFileSync('./dist/thrift.js', 'utf-8');
  const mapdthrift = readFileSync('./dist/mapd.thrift.js', 'utf-8');
  const mapdtypes = readFileSync('./dist/mapd_types.js', 'utf-8');
  const mapdcon = readFileSync('./dist/MapdCon.js', 'utf-8');
  return [thrift, mapdthrift, mapdtypes, mapdcon];
};

/**
 * Return a random alpha-numeric string.
 * @param {Number} len - length of the string to create
 * @param {String} [an] - 'A' for alpha only, 'N' for numeric only
 * @return {String} randomString
 * @example
 * randomString(10);        // "4Z8iNQag9v"
 * randomString(10, "A");   // "aUkZuHNcWw"
 * randomString(10, "N");   // "9055739230"
 */
export const randomString = (len, an) => {
  an = an && an.toLowerCase();
  let str = '';
  const min = an === 'a' ? 10 : 0;
  const max = an === 'n' ? 10 : 62;
  for (let i = 0; i < len; i++) {
    let r = Math.random() * (max - min) + min << 0;
    const s = r < 36 ? 55 : 61;
    const t = r > 9 ? s : 48;
    str += String.fromCharCode(r += t);
  }
  return str;
};


export const uploadFile = (sessionId, filename, callback) => {
  const options = {
    headers: { sessionId },
    multipart: true,
  };
  const postData = {
    data: {
      file: filename,
      content_type: 'multipart/form-data',
    },
  };
  needle.post(process.env.UPLOAD_URL, postData, options, callback);
};

export const deleteUploadedFile = (sessionId, filename, callback) => {
  const options = {
    headers: { sessionId },
    multipart: true,
  };
  const postData = {
    data: {
      file: filename,
    },
  };
  needle.post(process.env.DELETE_URL, postData, options, callback);
};

export const makeCopyParams = (context) => {

  // node context shim
  context = context || { TCopyParams: require('../../dist/node/mapd_types').TCopyParams };

  let copyParams = new context.TCopyParams();
  copyParams.delimiter = ',';
  copyParams.quoted = false;
  copyParams.null_str = 'null';
  return copyParams;
};
