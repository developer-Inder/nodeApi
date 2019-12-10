const { to } = require('await-to-js');
const pe = require('parse-error');
const db = {};
const CONFIG = require('../config/config');
const { database } = require('../utils/db');

module.exports.to = async promise => {
  let err, res;
  [err, res] = await to(promise);
  if (err) return [pe(err)];

  return [null, res];
};

module.exports.try = async (query, dataArray, single) => {
  try {
    var result = await database.query(query, dataArray, single);
    return [null, result];
  } catch (error) {
    return [error, null];
  }
};
module.exports.ReE = function(res, err, code = 403) {
  // Error Web Response
  if (typeof err == 'object' && typeof err.message != 'undefined') {
    console.log(err);
    err = err.message;
  }

  if (typeof code !== 'undefined') res.statusCode = code;

  return res.json({ status: 'error', success: false, error: err });
};

module.exports.ReS = function(res, data, code = 200) {
  // Success Web Response
  let send_data = { status: 'ok', success: true };

  if (typeof data == 'object') {
    send_data = Object.assign(data, send_data); //merge the objects
  }

  if (typeof code !== 'undefined') res.statusCode = code;

  return res.json(send_data);
};

module.exports.TE = function(err_message, log) {
  // TE stands for Throw Error
  if (log === true) {
    console.error(err_message);
  }

  throw new Error(err_message);
};

module.exports.rowtojson = function(data) {
  // TE stands for Throw Error
  return JSON.parse(JSON.stringify(data));
};
