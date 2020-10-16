const { RoomsConnections } = require('../services');

module.exports = (io) => {

  io.on('connect', socket => {

    socket.on('room_request', (roomID, username) => {
      /*
        1. check that the room connection exists (a.k.a the room id is valid)
        2. check that the username is valid (it is not in use)
        3. if game has started, send player to game also
      */

      try {

        const roomConnection = RoomsConnections.getRoomConnection(roomID);
        console.log('room_request command with roomID', roomID, 'and username', username);
        if (roomConnection !== null) {

          if (!RoomsConnections.getConnectedUsers(roomID, true)
              .includes(username)) {

            socket.join(roomID, () => {
              socket.to(roomID).emit('new_user', username);
              console.log('sent new_user command with', username, 'to:', roomID);
            });

            RoomsConnections.joinRoom(username, socket.id, roomID);
            socket.emit('room_request_success',
                        roomID,
                        RoomsConnections.getConnectedUsers(roomID, true));

            if (roomConnection.status.inGame) {
              // TODO: handle case when game is in highlights and not statement phase
              //       which is just to send the high/summary command after statement
              socket.emit('start_game');
              socket.emit('new_statement', roomConnection.room.currentStatement);
              console.log('sent user directly to game', roomID, 'with statement', roomConnection.room.currentStatement, 'socket id:', socket.id);
            }

            console.log('sent room_request_success command with', roomID, RoomsConnections.getConnectedUsers(roomID));

          } else {
            socket.emit('username_exists');
            console.log('username exists');
          }

        } else {
          console.log('room request failure: room doesnt exists');
          socket.emit('room_request_failure', roomID);
        }

      } catch (err) {
        console.log(err);
        socket.emit('room_request_failure', roomID);
      }
    });

    socket.on('create_room', username => {
      try {
        console.log('got create room request');
        const roomID = RoomsConnections.createRoom(username, socket.id);
        socket.join(roomID);
        socket.emit('create_room_success', roomID);
        console.log('succesfully created room:', roomID, 'SOCKET ID:', socket.id);

      } catch (err) {
        console.log(err);
        socket.emit('create_room_failure');
      }
    });

    socket.on('start_game', (roomID) => {
      console.log('received start_game event from room', roomID);
      RoomsConnections.startGame(roomID);
      const statement = RoomsConnections.newStatement(roomID);
      io.to(roomID).emit('start_game');
      io.to(roomID).emit('new_statement', statement);
    });

    socket.on('disconnect', reason => {
      console.log('removing user from room');
      const user = RoomsConnections.getUserObject(socket.id);
      if (user !== null) {
        const roomID = RoomsConnections.removeUserFromRoom(socket.id);
        if (roomID !== null) {
          socket.to(roomID).emit('remove_user', user.username);
        }
      }
    });

  });

};
