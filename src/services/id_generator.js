const crypto = require('crypto'); // to generate random room ids

module.exports = function (size) {
  return crypto.randomBytes(size).toString('hex');
}
