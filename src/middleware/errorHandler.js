// src/middleware/errorHandler.js
const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
};

module.exports = errorHandler;
