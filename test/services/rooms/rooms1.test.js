/* unit tests for RoomsConnections methods */

const { RoomsConnections, User, Room } = require('../../../src/services/rooms');

const testUser1 = new User('Ramon', 'aaaa');
const testUser2 = new User('Juan', 'bbbb');
const testUser3 = new User('Pedro', 'cccc');
const testUser4 = new User('Maria', 'dddd');

const roomID = RoomsConnections.createRoom(testUser1.username, testUser1.userID);

// TESTS

/***********************************************************/
if (!RoomsConnections.getRoomConnection(roomID).users[0].status.isAdmin) {
  throw 'user creating room must be admin';
}

/***********************************************************/
if (RoomsConnections.getRoomConnection(roomID) !== RoomsConnections.connections[roomID]) {
  const returns = RoomsConnections.getRoomConnection(roomID);
  throw new Error(`getRoomConnection returns ${returns}, should return ${RoomsConnections.connections[roomID]}`);
}

if (RoomsConnections.getRoomConnection('12345') !== null) {
  const returns = RoomsConnections.getRoomConnection('12345');
  throw new Error(`getRoomConnection returns ${returns}, should return ${null}`);
}
/***********************************************************/

/***********************************************************/
if (RoomsConnections.getConnectedUsers(roomID) !==
    RoomsConnections.connections[roomID].users) {
  const returns = getConnectedUsers();
  throw new Error(`getConnectedUsers with namesOnly false returns ${returns},
                    should return ${RoomsConnections.connections[roomID].users}`);
}

if (JSON.stringify(RoomsConnections.getConnectedUsers(roomID, true))
    !== JSON.stringify(RoomsConnections.connections[roomID].users.map(user => user.username))) {
  const returns = JSON.stringify(RoomsConnections.getConnectedUsers(roomID, true));
  throw new Error(`getConnectedUsers with namesOnly true returns ${returns}, should return ${JSON.stringify(['Ramon', 'Juan', 'Pedro', 'Maria'])}`);
}
/***********************************************************/

/***********************************************************/
/*
Cases:
  1. adding the user that created the room to users
*/
const newRoomID = RoomsConnections.createRoom('Ramon', 'aaaa');
console.log(`roomID created: ${newRoomID}`);

if (RoomsConnections.getRoomConnection(newRoomID).users[0].username !== 'Ramon') {
  throw new Error('createRoom not adding user Ramon to users');
}
/***********************************************************/

/***********************************************************/
/*
Cases:
  1. adding a user to an existing room, normal case
  2. adding a user to a non existing room
*/
const testUser5 = new User('Panchito', 'eeee');
RoomsConnections.joinRoom(testUser5.username, testUser5.userID, roomID);
if(!RoomsConnections.getConnectedUsers(roomID, true).includes('Panchito')) {
  throw new Error(`joinRoom not joining ${testUser5.username} to room ${roomID}`);
}

try {
  RoomsConnections.joinRoom(testUser5.username, testUser5.userID, 'asdda');
  throw 'joinRom adding users to non existing room'
} catch (err) {}


/***********************************************************/

/***********************************************************/
const testRoom = new Room('1223');
RoomsConnections.connections = {
  '1223': {
    users: [ testUser1, testUser2, testUser3, testUser4, testUser5 ],
    room: testRoom,
    status: {
      votedUsers: [],
      inGame: true,
      usersIDVotedReady: [],
    },
  },
}

const { user, roomID: removedRoomID } =
      RoomsConnections.removeUserFromRoom(testUser5.userID);

if (removedRoomID !== testRoom.roomID) {
  throw `rooms id dont match ${removedRoomID} ${testRoom.roomID}`;
}

if (user.username !== testUser5.username) {
  throw `usernames dont match ${user.username} ${testUser5.username}`;
}

if (RoomsConnections.getConnectedUsers(testRoom.roomID, true).includes(testUser5.username)) {
  throw new Error(`removeUserFromRoom not removing ${testUser5.userID} from room`);
}
/***********************************************************/


/***********************************************************/
try {
  RoomsConnections.startGame(testRoom.roomID);
} catch (e) {
  console.log('startGame failed', e);
}

if (!RoomsConnections.getRoomConnection(testRoom.roomID).status.inGame) {
  throw new Error(`startGame doesn't set inGame
                    to ${true}: ${RoomsConnections.getRoomConnection(testRoom.roomID).status.inGame}`);
}

if (JSON.stringify(RoomsConnections.getRoomConnection(testRoom.roomID).status.usersIDVotedReady)
    !== JSON.stringify([])) {
  throw new Error('startGame doesn\'t set usersIDVotedReady to []');
}
/***********************************************************/

/***********************************************************/
const statement = RoomsConnections.newStatement(testRoom.roomID);
if (!RoomsConnections.getRoomConnection(testRoom.roomID).room.currentStatement
    === statement) {
  throw new Error(`newStatement doesn't set currentStatement to ${statement}, instead to ${room().currentStatement}`);
}

if (!RoomsConnections.getRoomConnection(testRoom.roomID).room.statements.includes(statement)) {
  throw new Error(`newStatement doesn't push ${statement} to statements: ${room().statements}`);
}
/***********************************************************/

/***********************************************************/
/*
Cases:
  1. normal case, user voting, must return false
  1.1. handle voting twice
  1.2. add voted user to votedUsers list
  1.3. add authorID to usersIDVotedReady
  2. return true when all users have voted
*/
RoomsConnections.startGame(testRoom.roomID);
RoomsConnections.voteUser(testUser1.username, testUser2.userID, testRoom.roomID);
if (RoomsConnections.getRoomConnection(testRoom.roomID).status.usersIDVotedReady.length !== 1) {
  throw new Error('voteUser not adding user to usersIDVotedReady');
}

RoomsConnections.voteUser(testUser1.username, testUser2.userID, testRoom.roomID);
if (RoomsConnections.getRoomConnection(testRoom.roomID).status.usersIDVotedReady.length !== 1) {
  throw new Error('voteUser not handling user voting twice');
}

if (!RoomsConnections.getRoomConnection(testRoom.roomID).status.votedUsers.includes(testUser1.username)) {
  throw new Error(`voteUser doesnt add ${testUser1.username} to votedUsers`);
}

RoomsConnections.getRoomConnection(testRoom.roomID).users.forEach(user => {
  RoomsConnections.voteUser(testUser1.username, user.userID, testRoom.roomID);
});
/***********************************************************/

/***********************************************************/
/*
Cases:
 1. getting the most voted user
 2. more than one players are the most voted
*/
RoomsConnections.startGame(testRoom.roomID); // reset game
// user 1 votes for user 2
RoomsConnections.voteUser(testUser2.username, testUser1.userID, testRoom.roomID);
// user 2 votes for user 3
RoomsConnections.voteUser(testUser3.username, testUser2.userID, testRoom.roomID);
// user 3 votes for user 2
RoomsConnections.voteUser(testUser2.username, testUser3.userID, testRoom.roomID);
// user 4 votes for user 2
RoomsConnections.voteUser(testUser2.username, testUser4.userID, testRoom.roomID);

let votes = RoomsConnections.getVotes(testRoom.roomID);
if (votes[testUser2.username] !== 3 ||
    votes[testUser3.username] !== 1) {
  throw new Error(`getVotes error ${votes[testUser2.username]}`);
}

RoomsConnections.startGame(testRoom.roomID); // reset game
// user 1 votes for user 2
RoomsConnections.voteUser(testUser2.username, testUser1.userID, testRoom.roomID);
// user 2 votes for user 2
RoomsConnections.voteUser(testUser2.username, testUser2.userID, testRoom.roomID);
// user 3 votes for user 1
RoomsConnections.voteUser(testUser1.username, testUser3.userID, testRoom.roomID);
// user 4 votes for user 1
RoomsConnections.voteUser(testUser1.username, testUser4.userID, testRoom.roomID);


votes = RoomsConnections.getVotes(testRoom.roomID);

if (votes[testUser2.username] !== 2 ||
    votes[testUser1.username] !== 2 ||
    Object.entries(votes).length !== 2) {

    throw new Error('getVotes error');
}
/***********************************************************/

/***********************************************************/
  /*
    Cases:
      1. user sends ready event
      2. user that is ready sends ready event again
      3. all users are ready
  */
RoomsConnections.setUserReady(testUser1.userID, testRoom.roomID);
if (!RoomsConnections.getRoomConnection(testRoom.roomID).status.inSummary) {
  throw new Error('setUserReady not setting room status to inSummary: true');
}

if (RoomsConnections.getRoomConnection(testRoom.roomID).status.usersIDReady.length
    === RoomsConnections.getRoomConnection(testRoom.roomID).users.length) {
  throw new Error(`${RoomsConnections.getRoomConnection(testRoom.roomID).status.usersIDReady.length}
                  !== ${roomConnection.users.length}`);
}

if (!RoomsConnections.getRoomConnection(testRoom.roomID).status.usersIDReady
      .includes(testUser1.userID)) {
  throw new Error('setUserReady not adding userID to usersReady');
}

RoomsConnections.setUserReady(testUser1.userID, testRoom.roomID);
if (RoomsConnections.getRoomConnection(testRoom.roomID).status.usersIDReady.length !== 1) {
  throw new Error('setUserReady adding user twice to usersReady');
}

RoomsConnections.getRoomConnection(testRoom.roomID).users.forEach((user) => {
  RoomsConnections.setUserReady(user.userID, testRoom.roomID);
});
/***********************************************************/


console.log('All tests passed in rooms1.test.js');
