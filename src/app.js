/* eslint-disable no-undef */
const express = require('express');
const helmet = require('helmet');
const logger = require('morgan');
const cors = require('cors');

const middlewares = require('./middlewares');
// const routes = require('./routes');

const app = express();

app.use(helmet());
app.use(logger('common'));
app.use(cors());

PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`app listening at ${PORT}`);
});

// eslint-disable-next-line import/order
const io = require('socket.io')(server);

require('./sockets')(io); // returns a function that accepts io object

// mongoose.connect(process.env.DATABASE_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
//
// mongoose.connection.on('connected', () => {
//   console.log('Mongoose connected');
// });
//

app.get('/', (req, res) => {
  res.send('hello');
});

// middleware for 404 - not found
app.use(middlewares.notFound);
// last middleware, send 404 if statusCode is not found, else send 500 internal server error
app.use(middlewares.errorHandler);
