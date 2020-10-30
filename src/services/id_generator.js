const crypto = require('crypto'); // to generate random room ids

// eslint-disable-next-line func-names
module.exports = function (size) {
  return crypto.randomBytes(size).toString('hex');
};
