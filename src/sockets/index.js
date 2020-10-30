const room = require('./room');
const game = require('./game');

module.exports = (io) => {
  room(io);
  game(io);
};
