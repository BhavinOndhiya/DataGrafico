let dbConnection; // Variable to hold the database connection

const databaseConnection = (pool, logger, databaseType) => {
  // Middleware function to handle database connections
  return (req, res, next) => {
    if (!dbConnection) {
      // If there's no active database connection, establish a new connection
      pool.connect((err, client) => {
        if (err) {
          logger.error(`Unable to connect to the ${databaseType} database:`, err.message);
          res.locals.dbStatus = 500;
          next(err);
          return;
        }
        logger.info(`Connected to the ${databaseType} database`);
        dbConnection = client; // Store the database connection
        req.db = dbConnection; // Attach the database connection to the request
        next();
      });
    } else {
      // If the database connection is already established, reuse it
      req.db = dbConnection; // Attach the existing database connection to the request
      next();
    }
  };
};

module.exports = databaseConnection;
