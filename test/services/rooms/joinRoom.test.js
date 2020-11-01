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

RoomsConnections.joinRoom('testUser', '44', room.roomID);

const ids = RoomsConnections.connections[room.roomID].users
  .map(u => u.userID);

const usernames = RoomsConnections.connections[room.roomID].users
  .map(u => u.username);

if (!ids.includes('44') || !usernames.includes('testUser')) {
  console.log(RoomsConnections.connections[room.roomID].users);
  throw Error('joinRoom failed');
}

console.log('joinRoom passed ✓');
