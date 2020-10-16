const { RoomsConnections } = require('../services');

module.exports = (io) => {

  io.on('connect', socket => {
    socket.on('vote_user', (username, roomID) => {
      // socket votes for the username argument
      console.log('received vote_user event with username', username, 'and roomID', roomID, 'SOCKET ID:', socket.id);

      try {

        RoomsConnections.voteUser(username, socket.id, roomID);
        socket.emit('vote_success');

        const roomConnection = RoomsConnections.getRoomConnection(roomID)
        const usersIDVotedReady = roomConnection.status.usersIDVotedReady;

        const notVoted = RoomsConnections.getConnectedUsers(roomID)
                    .filter(user => !usersIDVotedReady.includes(user.userID))
                    .map(user => user.username);

        io.to(roomID).emit('new_voter', notVoted);
        console.log('users that have not voted:', notVoted);

        if (roomConnection.status.allUsersVoted) {
          const roundStats = RoomsConnections.getRoundStats(roomID);
          io.to(roomID).emit('round_end', roundStats);
          console.log('send round_end event with', roundStats);
        }

      } catch (err) {
        console.log(err);
      }

    });

    socket.on('ready', roomID => {
      RoomsConnections.setUserReady(socket.id, roomID);
      const roomConnection = RoomsConnections.getRoomConnection(roomID);
      const readyIDs = roomConnection.status.usersIDReady;

      const notReadyUsernames = RoomsConnections.getConnectedUsers(roomID)
                              .filter(user => !readyIDs.includes(user.userID))
                              .map(user => user.username);

      socket.emit('ready_success', notReadyUsernames);
      console.log('sent ready_success', notReadyUsernames);
      if (roomConnection.status.allUsersReady) {
        // returns true if all users have voted
        io.to(roomID).emit('next_round');
        RoomsConnections.startGame(roomID);
        const statement = RoomsConnections.newStatement(roomID);
        io.to(roomID).emit('new_statement', statement);
        console.log('sent next_round and new_statement');
      }
    });

  });

};
