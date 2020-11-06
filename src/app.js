/* eslint-disable no-undef */
const express = require('express');
const helmet = require('helmet');
const logger = require('morgan');
const cors = require('cors');

const app = express();

app.use(helmet());
app.use(logger('common'));
app.use(cors());

PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  const date = new Date();
  const hms = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  console.log(`app listening at ${PORT} - ${hms}`);
});

// eslint-disable-next-line import/order
const io = require('socket.io')(server);

require('./sockets')(io); // returns a function that accepts io object
