const idGenerator = require('./id_generator');

class User {
  constructor(username, userID) {
    this.username = username;
    this.userID = userID;
    this.status = {};
  }
}

class Room {
  constructor(roomID) {
    this.roomID = roomID;
    this.status = {};
    this.statements = [];
    this.currentStatement = null;
  }
}

class RoomsConnections {

  static connections = {};

  static getRoomConnection(roomID) {
    /*
      roomConnection is what is stored in this.connections[],
      example:
        this.connections = {
          roomID(String): {
            users: [],
            room: room object,
            status: {},
          }
        }

        the key is the room id, and the value is an object storing users
        objects in a list, and the room object.
    */
    if (Object.keys(this.connections).includes(roomID)) {
      return this.connections[roomID];
    }
    return null;
  }

  static createRoom(username, userID) {
    let exists = true;
    let randomID;
    while (exists) {
      randomID = idGenerator(2);
      if (!Object.keys(this.connections).includes(randomID)) {
        exists = false;
      }
    }

    const room = new Room(randomID);
    const user = new User(username, userID);
    user.status = { isAdmin: true };
    this.connections[randomID] = {
      users: [ user ],
      status: {},
      room,
    };
    return randomID;
  }

  static joinRoom(username, userID, roomID) {
    const user = new User(username, userID);
    const roomConnection = this.getRoomConnection(roomID);
    roomConnection.users.push(user);
  }

  static getConnectedUsers(roomID, usernameOnly = false) {
    const { users } = this.getRoomConnection(roomID);
    if (usernameOnly) {
      return users.map(user => user.username);
    }
    return users;
  }

  static removeUserFromRoom(userID) {
    /*
    returns first room a user is in and removes user from room,
    otherwise if the user is not in any room, returns null
    */
    for (const [roomID, roomConnection] of Object.entries(this.connections)) {
      const idx = roomConnection.users
        .map(user => user.userID).indexOf(userID);
      if (idx > -1) {
        const user = roomConnection.users[idx];
        roomConnection.users.splice(idx, 1);
        return { user, roomID };
      }
    }

    return { user: null, roomID: null };
  }

  static deleteRoom(roomID) {
    // TODO: remove connection
    console.log('removing room', roomID);
  }

  static startGame(roomID) {
    const roomConnection = this.getRoomConnection(roomID);
    const { users } = roomConnection;
    /* reads base statements fromm json file */
    roomConnection.status = {
      inGame: true,
      usersWithoutStatement: users.map(u => u.username),
    };
  }

  static addUserStatement(statement, userID, roomID) {
    const roomConnection = this.getRoomConnection(roomID);
    const { username } = roomConnection.users
      .find(user => user.userID === userID);
    if (roomConnection.status.usersWithoutStatement.includes(username)) {
      roomConnection.room.statements.push(statement);
      const idx = roomConnection.status.usersWithoutStatement.indexOf(username);
      roomConnection.status.usersWithoutStatement.splice(idx, 1);
    }
  }

  static newStatement(roomID) {
    const roomConnection = this.getRoomConnection(roomID);
    const randomIndex = Math.floor(Math.random() *
      roomConnection.room.statements.length);
    const statement = roomConnection.room.statements.pop(randomIndex);
    /* get a random statement from the statements pool */
    roomConnection.room.currentStatement = statement;
    roomConnection.status = {
      inStatement: true,
      usersNotReady: roomConnection.users.map(u => u.username),
    };
    return statement;
  }

  static userReadyForNextStatement(userID, roomID) {
    const roomConnection = this.getRoomConnection(roomID);
    const { username } = roomConnection.users
      .find(user => user.userID === userID);
    if (roomConnection.status.usersNotReady.includes(username)) {
      const idx = roomConnection.status.usersNotReady.indexOf(username);
      roomConnection.status.usersNotReady.splice(idx, 1);
    }
  }
}

module.exports = { RoomsConnections, User, Room };
