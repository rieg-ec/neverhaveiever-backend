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

const users = RoomsConnections.getConnectedUsers(room.roomID);

if (!users.includes(user1 && user2 && user3)) {
  throw Error('getConnectedUsers failed');
}

const usernames = RoomsConnections.getConnectedUsers(room.roomID, true);

if (!usernames.includes(user1.username && user2.username && user3.username)
  || !Array.isArray(usernames)) {
  throw Error('getConnectedUsers failed');
}

console.log('getConnectedUsers passed ✓');
