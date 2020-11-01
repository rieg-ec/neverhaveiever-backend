const { RoomsConnections } = require('../../../src/services/rooms');

RoomsConnections.connections = {};

const roomID = RoomsConnections.createRoom('Ramon', '44');

if (!RoomsConnections.connections[roomID]) {
  throw Error('createRoom failed');
}

if (!RoomsConnections.connections[roomID].users
  .map(u => u.userID)
  .includes('44')) {
  throw Error('createRoom failed');
}

console.log('createRoom passed ✓');
