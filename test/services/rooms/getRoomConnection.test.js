const { RoomsConnections, User, Room } = require('../../../src/services/rooms');

const user1 = new User('User1', '11');
const user2 = new User('User2', '22');
const user3 = new User('User3', '33');

const room = new Room('1223');

RoomsConnections.connections = {
  1223: {
    users: [ user1, user2, user3 ],
    room,
    status: {},
  },
};

if (RoomsConnections.getRoomConnection(room.roomID)
  !== RoomsConnections.connections['1223']) {
  throw Error('getRoomConnection failed');
}

if (RoomsConnections.getRoomConnection('nonexistent')
  !== null) {
  throw Error('getRoomConnection failed');
}

console.log('getRoomConnection passed ✓');
