const { RoomsConnections, User, Room } = require('../../../src/services/rooms');

const user1 = new User('User1', '11');
const user2 = new User('User2', '22');
const user3 = new User('User3', '33');
const user4 = new User('User4', '44');
const user5 = new User('User5', '55');

const room = new Room('1223');

RoomsConnections.connections = {
  1223: {
    users: [ user1, user2, user3, user4, user5 ],
    room,
    status: {
      inStatement: true,
      usersNotReady: [
        user1.username,
        user2.username,
        user3.username,
        user4.username,
        user5.username,
      ],
    },
  },
};

RoomsConnections.userReadyForNextStatement(user5.userID, room.roomID);

if (!RoomsConnections.connections[room.roomID].status.usersNotReady
  .includes((user1.username && user2.username && user3.username && user4.username))) {
  throw Error('userReadyForNextStatement failed');
}

if (RoomsConnections.connections[room.roomID].status.usersNotReady
  .includes((user5.username))) {
  throw Error('userReadyForNextStatement failed');
}

console.log('userReadyForNextStatement passed ✓');
