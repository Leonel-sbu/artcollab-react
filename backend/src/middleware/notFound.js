module.exports = (req, res, next) => {
  const error = new Error('Not Found - ' + req.originalUrl);
  error.statusCode = 404;
  next(error);
};
