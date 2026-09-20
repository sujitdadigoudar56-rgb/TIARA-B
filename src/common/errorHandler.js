const ApiError = require('./ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Already exists' });
  }
  if (err.message?.startsWith('Origin ') && err.message?.endsWith('not allowed')) {
    return res.status(403).json({ message: 'Origin not allowed' });
  }
  console.error(err);
  return res.status(500).json({ message: 'Something went wrong' });
}

module.exports = errorHandler;
