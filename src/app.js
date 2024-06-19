// Load environment variables from .env file
require('dotenv').config();

const fs = require('fs');
const https = require('https');
const express = require('express');
const { Pool } = require('pg'); // Import Pool from pg
const sqlite3 = require('sqlite3').verbose(); 
const companyRoutes = require('./routes/companyRoutes'); // Import company routes
const companiesRoutes = require('./routes/companiesRoutes');
//const filtercompaniesRoute = require('./routes/filterCompanies');
const directorRoutes = require('./routes/directorRoutes');
const directorsRoutes = require('./routes/directorsRoutes');
// const companiesByDate = require('./routes/companiesByDates');
//const searchCompany = require('./routes/searchRoute');
const statusRoute = require('./routes/statusRoute'); // Import status route
const logger = require('./middleware/logger'); // Import logger middleware
const errorHandler = require('./middleware/errorHandler'); // Import error handler middleware
const databaseConnection = require('./middleware/databaseConnection'); // Import database connection middleware
const databaseConfigs = require('./config/config');
const postgresql_config = require('./config/postgresql_config');
//const { pool } = require('./config/postgresql_config');

const app = express();
const API_VERSION = 'v1'; // Define the API version here
const PORT = process.env.PORT ;

/*const options = {
  cert: fs.readFileSync('/etc/letsencrypt/live/api.datagrafi.co/fullchain.pem'),
  key: fs.readFileSync('/etc/letsencrypt/live/api.datagrafi.co/privkey.pem')
};*/

app.use(express.json());

// // Create the pool object based on the database configuration
// const pool = new Pool(config);

// Create the appropriate database connection based on the database type
let db;
let pool;
//console.log("-=-=-=-"+process.env.DB_TYPE);
// console.log("-=-=-=-=-=-=-"+JSON.stringify(databaseConfigs.path.databaseConfig.path));

if (process.env.DB_TYPE === 'sqlite') {
  console.log('Loading SQLite database configuration...');
  db = new sqlite3.Database(databaseConfigs.path.databaseConfig.path); // Create SQLite database instance
  // pool = sqlite_config.db;
  
console.log(pool);
  console.log('SQLite database configuration loaded successfully.');
} else if (process.env.DB_TYPE === 'postgresql') {
  console.log('Loading PostgreSQL database configuration...');
  pool = postgresql_config.pool;
  console.log('PostgreSQL database configuration loaded successfully.');
 // Middleware for handling database connections
app.use((req, res, next) => {
  if (pool) {
    databaseConnection(pool, logger)(req, res, next); // Pass the pool and logger objects to the middleware
  } else {
    next(new Error('Database pool is not initialized'));
  }
});
} else {
  throw new Error('Unsupported database type');
}

// Middleware for logging requests

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});
//Middleware for handling database connections
// app.use((req, res, next) => {
//   const pool = databaseConfig().pool; // Get the appropriate pool object from the configuration
//   databaseConnection(pool, logger)(req, res, next); // Pass the pool and logger objects to the middleware
// });




app.use(`/status`, statusRoute); // Mount company routes

// Route for get request for single cin
app.use(`/api/${API_VERSION}/company`, companyRoutes); // Mount company routes

// Route for post request for multiple cin
app.use(`/api/${API_VERSION}/companies`,companiesRoutes);

// Route for get request for single din
app.use(`/api/${API_VERSION}/director`, directorRoutes); 

// Route for post request for multiple din
app.use(`/api/${API_VERSION}/directors`,directorsRoutes);

//Route to filter companies
//app.use(`/api/${API_VERSION}/filter`, filtercompaniesRoute)

// Route for post request for multiple Companies on base of Date Of Registration
// app.use(`/api/${API_VERSION}/date`,companiesByDate);

// Route for post request for multiple Companies on base of filter
//app.use(`/api/${API_VERSION}/search`,searchCompany);


// Error handling middleware
app.use((err, req, res, next) => {
  errorHandler(err, req, res, next);
});

// // Export the app and pool objects
// module.exports = { app, pool };

// Start the server
if (!module.parent) { // Check if the module is being run directly
  app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
  });
  //https.createServer(options, app).listen(443);
}
module.exports = app;

