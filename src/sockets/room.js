const { RoomsConnections } = require('../services');

// eslint-disable-next-line func-names
module.exports = (io) => {

  io.on('connect', (socket) => {
    function disconnectSocket() {
      const { user, roomID } = RoomsConnections.removeUserFromRoom(socket.id);
      socket.leave(roomID);

      if (roomID !== null) {
        const roomConnection = RoomsConnections.getRoomConnection(roomID);
        const usernames = RoomsConnections.getConnectedUsers(roomID);
        io.to(roomID).emit('connected_users', usernames);
        if (user.status.isAdmin) {
          RoomsConnections.deleteRoom(roomID);
          io.to(roomID).emit('kicked');
        } else if (roomConnection.status.inGame &&
                  !roomConnection.status.usersWithoutStatement.length) {
          // io.to(roomID).emit('start_statements');
          const statement = RoomsConnections.newStatement(roomID);
          io.to(roomID).emit('new_statement', statement);

        } else if (roomConnection.status.inStatement &&
                  !roomConnection.status.usersNotReady.length) {
          if (roomConnection.room.statements.length) {
            const newStatement = RoomsConnections.newStatement(roomID);
            io.to(roomID).emit('new_statement', newStatement);
          } else {
            RoomsConnections.startGame(roomID);
            io.to(roomID).emit('start_game');
          }
        }
      }
    }

    socket.on('create_room', (username) => {
      try {
        const roomID = RoomsConnections.createRoom(username, socket.id);
        socket.join(roomID);
        socket.emit('create_room_success', roomID);
      } catch (err) {
        socket.emit('create_room_failure');
      }
    });

    socket.on('join_room', (roomID, username) => {
      /*
        1. check that the room connection exists (a.k.a the room id is valid)
        2. check that the username is valid (it is not in use)
        3. if game has started, send player to game also
        4. if game has started and is inStatement, send current statement
      */
      try {
        const roomConnection = RoomsConnections.getRoomConnection(roomID);
        if (roomConnection !== null) {

          if (!RoomsConnections.getConnectedUsers(roomID, true)
            .includes(username)) {

            RoomsConnections.joinRoom(username, socket.id, roomID);
            socket.join(roomID);
            socket.emit(
              'join_room_success',
              roomID,
            );

            io.to(roomID).emit(
              'connected_users',
              RoomsConnections.getConnectedUsers(roomID),
            );

            if (roomConnection.status.inGame) {
              socket.emit('start_game');
              if (roomConnection.status.inStatement) {
                socket.emit(
                  'new_statement',
                  roomConnection.room.currentStatement,
                );
              }

            }

          } else {
            socket.emit('username_exists');
          }
        } else {
          socket.emit('join_room_failure', roomID);
        }
      } catch (err) {
        socket.emit('join_room_failure', roomID);
      }
    });

    socket.on('start_game', (roomID) => {
      RoomsConnections.startGame(roomID);
      io.to(roomID).emit('start_game');
    });

    socket.on('disconnect', disconnectSocket);
    socket.on('leave_room', disconnectSocket);
  });

};
