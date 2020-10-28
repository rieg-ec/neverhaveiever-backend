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
    const users = this.getRoomConnection(roomID).users;
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

  static changeAdmin(roomID) {
    const roomConnection = this.getRoomConnection(roomID);
    const newAdmin = roomConnection.users[0];
    newAdmin.status = { isAdmin: true };
    return newAdmin;
  }

  static startGame(roomID) {
    const roomConnection = this.getRoomConnection(roomID);
    const usersIDs = this.getConnectedUsers(roomID).map(user => user.userID);
    roomConnection.status = {
      votedUsers: [],
      inGame: true,
      usersIDVotedReady: [],
    }
  }

  static newStatement(roomID) {
    const room = this.getRoomConnection(roomID).room;
    const statement = 'hei xd im a statement, have a nice day';
    // TODO: create statement and validate
    room.currentStatement = statement;
    room.statements.push(statement);
    return statement;
  }

  static voteUser(username, authorID, roomID) {
    // TODO: handle invalid username?
    const roomConnection = this.getRoomConnection(roomID);
    if (!roomConnection.status.usersIDVotedReady.includes(authorID)) {
      roomConnection.status.usersIDVotedReady.push(authorID);
    }

    const usernames = this.getConnectedUsers(roomID, true);
    if (usernames.includes(username)) {
      roomConnection.status.votedUsers.push(username);
    }
}

  static getVotes(roomID) {
    const roomConnection = this.getRoomConnection(roomID);
    const votedUsers = roomConnection.status.votedUsers;
    const usersSet = [...new Set(votedUsers)];
    const votes = {};
    usersSet.forEach((user) => {
      const count = votedUsers.filter(
        u => u == user).length;
      votes[user] = count;
    });

    roomConnection.status = {
      inSummary: true,
      usersIDReady: [],
    }

    return votes;
  }

  static setUserReady(userID, roomID) {
    const roomConnection = this.getRoomConnection(roomID);
    if (!roomConnection.status.usersIDReady.includes(userID)) {
      roomConnection.status.usersIDReady.push(userID);
    }
  }

};

module.exports = { RoomsConnections, User, Room };
