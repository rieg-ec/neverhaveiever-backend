const { RoomsConnections, User, Room } = require('./rooms');

const testRoom = new Room('1234');
const testUser1 = new User('Ramon', 'aaaa');
const testUser2 = new User('Juan', 'bbbb');
const testUser3 = new User('Pedro', 'cccc');
const testUser4 = new User('Maria', 'dddd');

RoomsConnections.connections = {
  '1234': {
    users: [ testUser1, testUser2, testUser3, testUser4 ],
    room: testRoom,
    status: {},
  },
};

const roomID = '1234'

const connectedUsers = () => {
  return RoomsConnections.getConnectedUsers(roomID);
}

const room = () => {
  return RoomsConnections.getRoomConnection(testRoom.roomID).room;
}

const roomConnection = () => {
  return RoomsConnections.getRoomConnection(testRoom.roomID);
}

const usersIDs = () => {
  return RoomsConnections.getConnectedUsers(testRoom.roomID).map(user => user.userID);
};

RoomsConnections.createRoom(testUser1.username, roomID);

// TESTS

/***********************************************************/
if (roomConnection() !== RoomsConnections.connections[testRoom.roomID]) {
  const returns = RoomsConnections.getRoomConnection(testRoom.roomID);
  throw new Error(`getRoomConnection returns ${returns}, should return ${RoomsConnections.connections[testRoom.roomID]}`);
}

if (RoomsConnections.getRoomConnection('12345') !== null) {
  const returns = RoomsConnections.getRoomConnection('12345');
  throw new Error(`getRoomConnection returns ${returns}, should return ${null}`);
}
/***********************************************************/


/***********************************************************/
if (RoomsConnections.getUserObject('aaaa') !== testUser1) {
  const returns = RoomsConnections.getUserObject('aaaa');
  throw new Error(`getUserObject returns ${returns}, should return ${testUser1}`);
}
/***********************************************************/

/***********************************************************/
if (RoomsConnections.getConnectedUsers(roomID) !==
    RoomsConnections.connections[testRoom.roomID].users) {
  const returns = getConnectedUsers();
  throw new Error(`getConnectedUsers with namesOnly false returns ${returns}, should return ${RoomsConnections.connections[testRoom.roomID].users}`);
}

if (JSON.stringify(RoomsConnections.getConnectedUsers(testRoom.roomID, true))
    !== JSON.stringify(['Ramon', 'Juan', 'Pedro', 'Maria'])) {
  const returns = JSON.stringify(RoomsConnections.getConnectedUsers(testRoom.roomID, true));
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
  3. adding a user to a room that is in game
*/
const testUser5 = new User('Panchito', 'eeee');
RoomsConnections.joinRoom(testUser5.username, testUser5.userID, roomID);
if(!RoomsConnections.getConnectedUsers(testRoom.roomID, true).includes('Panchito')) {
  throw new Error(`joinRoom not joining ${testUser5.username} to room ${testRoom.roomID}`);
}

try {
  RoomsConnections.joinRoom(testUser5.username, testUser5.userID, 'asdda');
} catch (err) {

}

RoomsConnections.connections['1223'] = {
  users: [ testUser1, testUser2, testUser3, testUser4 ],
  room: testRoom,
  status: {
    votedUsers: [],
    inGame: true,
    pendingToVoteUsersIDs: [],
  },
}
/***********************************************************/

/***********************************************************/
try {
  RoomsConnections.removeUserFromRoom(testUser5.userID);
} catch (e) {
  console.log(`removeUserFromRoom failed ${e}`);
}

if(RoomsConnections.getConnectedUsers(testRoom.roomID, true).includes('Panchito')) {
  throw new Error(`removeUserFromRoom not removing ${testUser5.userID} from room`);
}
/***********************************************************/


/***********************************************************/
try {
  RoomsConnections.startGame(testRoom.roomID);
} catch (e) {
  console.log('startGame failed', e);
}

if (!roomConnection().status.inGame) {
  throw new Error(`startGame doesn't set inGame to ${true}: ${roomConnection().status.inGame}`);
}

if (JSON.stringify(roomConnection().status.usersIDVotedReady)
    !== JSON.stringify([])) {
  throw new Error('startGame doesn\'t set usersIDVotedReady to []');
}
/***********************************************************/

/***********************************************************/
const statement = RoomsConnections.newStatement(testRoom.roomID);
if (!room().currentStatement === statement) {
  throw new Error(`newStatement doesn't set currentStatement to ${statement}, instead to ${room().currentStatement}`);
}

if (!room().statements.includes(statement)) {
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
RoomsConnections.voteUser(testUser1.username, testUser2.userID, roomID);
if (roomConnection().status.allUsersVoted) {
  throw new Error('allUsersVoted is not false when there are users left to vote');
}
if (roomConnection().status.usersIDVotedReady.length !== 1) {
  throw new Error('voteUser not adding user to usersIDVotedReady');
}

RoomsConnections.voteUser(testUser1.username, testUser2.userID, roomID);
if (roomConnection().status.usersIDVotedReady.length !== 1) {
  throw new Error('voteUser not handling user voting twice');
}

if (!roomConnection().status.votedUsers.includes(testUser1.username)) {
  throw new Error(`voteUser doesnt add ${testUser1.username} to votedUsers`);
}

roomConnection().users.forEach(user => {
  RoomsConnections.voteUser(testUser1.username, user.userID, roomID);
});

if (!roomConnection().status.allUsersVoted) {
  throw new Error('allUsersVoted not true when all users have voted');
}
/***********************************************************/

/***********************************************************/
/*
Cases:
 1. getting the most voted user
 2. more than one players are the most voted
*/
RoomsConnections.startGame(roomID); // reset game
// user 1 votes for user 2
RoomsConnections.voteUser(testUser2.username, testUser1.userID, roomID);
// user 2 votes for user 3
RoomsConnections.voteUser(testUser3.username, testUser2.userID, roomID);
// user 3 votes for user 2
RoomsConnections.voteUser(testUser2.username, testUser3.userID, roomID);
// user 4 votes for user 2
RoomsConnections.voteUser(testUser2.username, testUser4.userID, roomID);

let roundStats = RoomsConnections.getRoundStats(roomID);

if (roundStats.reps !== 3 ||
    roundStats.mostVoted[0] !== testUser2.username ||
    roundStats.mostVoted.length !== 1) {
  const returns = roundStats;
  throw new Error(`getRoundStats doesnt return most voted: ${returns}
                  should be { [${testUser2.username}], 3 }`);
}

RoomsConnections.startGame(roomID); // reset game
// user 1 votes for user 2
RoomsConnections.voteUser(testUser2.username, testUser1.userID, roomID);
// user 2 votes for user 2
RoomsConnections.voteUser(testUser2.username, testUser2.userID, roomID);
// user 3 votes for user 1
RoomsConnections.voteUser(testUser1.username, testUser3.userID, roomID);
// user 4 votes for user 1
RoomsConnections.voteUser(testUser1.username, testUser4.userID, roomID);


roundStats = RoomsConnections.getRoundStats(roomID);

if (roundStats.reps !== 2 || roundStats.mostVoted.length !== 2 ||
    !roundStats.mostVoted.includes(testUser2.username) ||
    !roundStats.mostVoted.includes(testUser1.username)) {

  const returns = roundStats;
  throw new Error(`getRoundStats doesnt return most voted: ${returns}
                  should be { [${testUser2.username}, ${testUser1.username}], 2 }`);
}
/***********************************************************/

/***********************************************************/
  /*
    Cases:
      1. user sends ready event
      2. user that is ready sends ready event again
      3. all users are ready
  */
RoomsConnections.setUserReady(testUser1.userID, roomID);
if (!RoomsConnections.getRoomConnection(roomID).status.inSummary) {
  throw new Error('setUserReady not setting room status to inSummary: true');
}

if (roomConnection().status.allUsersReady) {
  throw new Error('allUsersReady not false when not all users ready');
}

if (!RoomsConnections.getRoomConnection(roomID).status.usersIDReady
.includes(testUser1.userID)) {
  throw new Error('setUserReady not adding userID to usersReady');
}

RoomsConnections.setUserReady(testUser1.userID, roomID);
if (RoomsConnections.getRoomConnection(roomID).status.usersIDReady.length !== 1) {
  throw new Error('setUserReady adding user twice to usersReady');
}

roomConnection().users.forEach((user) => {
  RoomsConnections.setUserReady(user.userID, roomID);
});

if (!roomConnection().status.allUsersReady) {
  throw new Error('allUsersReady not true when all users have voted');
}
/***********************************************************/


console.log('All tests passed');
