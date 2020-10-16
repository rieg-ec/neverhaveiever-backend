// middle ware for 404 - not found
const notFound  = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// last middleware, send 404 if statusCode is not found, else send 500 internal server error
const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode == 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV == 'production' ? '' : error.stack,
  });
};


module.exports = {
  notFound,
  errorHandler
}
