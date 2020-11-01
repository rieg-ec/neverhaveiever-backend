const { RoomsConnections } = require('../services');
// eslint-disable-next-line func-names
module.exports = (io) => {

  io.on('connect', (socket) => {
    socket.on('submit_statement', (statement, roomID) => {
      RoomsConnections.addUserStatement(statement, socket.id, roomID);

      const roomConnection = RoomsConnections.getRoomConnection(roomID);
      io.to(roomID).emit(
        'users_without_statement',
        roomConnection.status.usersWithoutStatement,
      );

      if (!roomConnection.status.usersWithoutStatement.length) {
        io.to(roomID).emit('start_statements');
        const newStatement = RoomsConnections.newStatement(roomID);
        io.to(roomID).emit('new_statement', newStatement);
      }
    });

    socket.on('ready_for_next_statement', (roomID) => {
      RoomsConnections.userReadyForNextStatement(socket.id, roomID);
      const roomConnection = RoomsConnections.getRoomConnection(roomID);

      io.to(roomID).emit('users_not_ready', roomConnection.status.usersNotReady);

      if (!roomConnection.status.usersNotReady.length) {
        if (roomConnection.room.statements.length) {
          const newStatement = RoomsConnections.newStatement(roomID);
          io.to(roomID).emit('new_statement', newStatement);
        } else {
          RoomsConnections.startGame(roomID);
          io.to(roomID).emit('start_game');
        }

      }

    });
  });
};
