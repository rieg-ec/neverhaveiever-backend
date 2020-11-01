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
    status: {},
  },
};

let { user, roomID } = RoomsConnections.removeUserFromRoom(user5.userID);

if (user !== user5 || roomID !== room.roomID) {
  throw Error('removeUserFromRoom failed');
}

({ user, roomID } = RoomsConnections.removeUserFromRoom(user5.userID));

if (user || roomID) {
  /* should have returned null both  */
  throw Error('removeUserFromRoom failed');
}

console.log('removeUserFromRoom passed ✓');
