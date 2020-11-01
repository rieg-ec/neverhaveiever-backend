const { RoomsConnections, User, Room } = require('../../../src/services/rooms');

const user1 = new User('User1', '11');
const user2 = new User('User2', '22');
const user3 = new User('User3', '33');
const user4 = new User('User4', '44');

const room = new Room('1223');

room.statements = [ 'statement 1', 'statement2' ];

RoomsConnections.connections = {
  1223: {
    users: [ user1, user2, user3, user4 ],
    room,
    status: {
      inGame: true,
      usersWithoutStatement: [],
    },
  },
};

const statement = RoomsConnections.newStatement(room.roomID);
const usernames = RoomsConnections.connections[1223].users.map(u => u.username);

if (JSON.stringify(RoomsConnections.connections[room.roomID].status)
  !== JSON.stringify({ inStatement: true, usersNotReady: usernames })) {
  throw Error('newStatement failed');
}

if (!statement || room.statements.includes(statement)) {
  throw Error('newStatement failed');
}

console.log('newStatement passed ✓');
