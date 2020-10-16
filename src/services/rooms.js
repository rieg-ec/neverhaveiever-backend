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

  static getUserObject(userID) {
    // TODO: optimize
    const roomIDs = Object.keys(this.connections);
    for (const roomID of roomIDs) {
      const users = this.connections[roomID].users;
      for (const user of users) {
        if (user.userID === userID) { return user; }
      }
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
    if (usernameOnly) { return users.map(user => user.username); }
    else { return users ;}
  }

  static removeUserFromRoom(userID) {
    const user = this.getUserObject(userID);
    for (const roomID of Object.keys(this.connections)) {
      const idx = this.getRoomConnection(roomID).users.indexOf(user);
      if (idx > -1) {
        this.getRoomConnection(roomID).users.splice(idx, 1);
        return roomID;
      }
    }

    return null;
  }

  static startGame(roomID) {
    const roomConnection = this.getRoomConnection(roomID);
    const usersIDs = this.getConnectedUsers(roomID).map(user => user.userID);
    roomConnection.status = {
      votedUsers: [],
      inGame: true,
      usersIDVotedReady: [],
      allUsersVoted: false,
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

    if (usernames.length === roomConnection.status.usersIDVotedReady.length) {
      roomConnection.status.allUsersVoted = true;
    }
}

  static getRoundStats(roomID) {
    const roomConnection = this.getRoomConnection(roomID);
    const votedUsers = roomConnection.status.votedUsers;
    const usersSet = [...new Set(votedUsers)];
    let mostVoted = [];
    let reps = 0;
    for (let i = 0; i < usersSet.length; i++) {
      // calculate amount of votes and username of most voted
      const count = votedUsers.filter(
        u => u == usersSet[i]).length;

      if (count > reps) {
        mostVoted = [usersSet[i]];
        reps = count;
      } else if (count == reps) {
        mostVoted.push(usersSet[i]);
      }
    }

    roomConnection.status = {
      inSummary: true,
      usersIDReady: [],
      allUsersReady: false,
    };

    return { reps, mostVoted };
  }

  static setUserReady(userID, roomID) {
    const roomConnection = this.getRoomConnection(roomID);
    if (!roomConnection.status.usersIDReady.includes(userID)) {
      roomConnection.status.usersIDReady.push(userID);
    }
    if (roomConnection.status.usersIDReady.length
        === roomConnection.users.length) {
      roomConnection.status.allUsersReady = true;
    }
  }

};

module.exports = { RoomsConnections, User, Room };
