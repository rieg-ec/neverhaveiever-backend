/* unit test for server situations */

const { RoomsConnections, User, Room } = require('../../../src/services/rooms');

const testUser1 = new User('Ramon', 'aaaa');
const testUser2 = new User('Juan', 'bbbb');
const testUser3 = new User('Pedro', 'cccc');
const testUser4 = new User('Maria', 'dddd');

const testRoom = new Room('1223');
RoomsConnections.connections = {
  1223: {
    users: [testUser1, testUser2, testUser3, testUser4],
    room: testRoom,
    status: {
      votedUsers: [
        testUser3.username,
        testUser3.username,
        testUser3.username,
      ],
      inGame: true,
      usersIDVotedReady: [
        testUser2.userID,
        testUser3.userID,
        testUser4.userID,
      ],
    },
  },
};

/* test user leaving room when all others have voted */
const socketID = testUser1.userID;
let { user, roomID } = RoomsConnections.removeUserFromRoom(socketID);
if (roomID !== null) {
  const roomConnection = RoomsConnections.getRoomConnection(roomID);
  if (roomConnection.status.inGame) {
    // Check if users remaining have all voted:
    if (roomConnection.status.usersIDVotedReady.length
        === roomConnection.users.length) {
      const votes = RoomsConnections.getVotes(roomID);
      if (user.username !== testUser1.username ||
          JSON.stringify(votes) !== JSON.stringify({ Pedro: 3 })) {
        throw Error('error in disconnect event');
      }
    }
  } else { throw Error('not inGame'); }
} else { throw Error('not entering roomID if block'); }

/* test user leaving room when all others are ready in summary */
RoomsConnections.connections = {
  1223: {
    users: [testUser1, testUser2, testUser3, testUser4],
    room: testRoom,
    status: {
      inSummary: true,
      usersIDReady: [
        testUser2.userID,
        testUser3.userID,
        testUser4.userID,
      ],
    },
  },
};

({ user, roomID } = RoomsConnections.removeUserFromRoom(socketID));

if (roomID !== null) {
  const roomConnection = RoomsConnections.getRoomConnection(roomID);
  if (roomConnection.status.inSummary) {
    if (roomConnection.status.usersIDReady.length
          !== roomConnection.users.length) {
      throw Error('usersIDReady.length !== roomConnection.users.length');
    }
  } else { throw Error('not entering username if block'); }
} else { throw Error('not entering roomID if block'); }

/* test user leaving room when isAdmin */
const adminSocketID = testUser2.userID;
testUser2.status = { isAdmin: true };
RoomsConnections.connections = {
  1223: {
    users: [testUser1, testUser2, testUser3, testUser4],
    room: testRoom,
    status: {
      inSummary: true,
      usersIDReady: [
        testUser2.userID,
        testUser3.userID,
        testUser4.userID,
      ],
    },
  },
};

({ user, roomID } = RoomsConnections.removeUserFromRoom(adminSocketID));

if (roomID !== null) {
  if (user.status.isAdmin) {
    const newAdmin = RoomsConnections.changeAdmin(roomID);
    if (!newAdmin) {
      throw Error(`changeAdmin returns ${newAdmin}`);
    }
  } else { throw Error('user.isAdmin not true'); }
} else { throw Error('not entering roomID if block'); }

console.log('All tests passed in rooms2.test.js');
