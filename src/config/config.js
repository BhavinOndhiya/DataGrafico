// config.js
require('dotenv').config();
let databaseConfigspath;
if (process.env.DB_TYPE === 'sqlite') {
    console.log('Loading SQLite database configuration...');
    databaseConfigspath = require('./sqlite_config');
    console.log('SQLite database configuration loaded successfully.');
} else if (process.env.DB_TYPE === 'postgresql') {
    console.log('Loading PostgreSQL database configuration...');
    databaseConfigspath = require('./postgresql_config');
    console.log('PostgreSQL database configuration loaded successfully.');
} else {
    throw new Error('Unsupported database type');
}
const databaseConfigs = {
  client: process.env.DB_TYPE,
  path: databaseConfigspath,
};
// module.exports = { database: databaseConfig }; // Ensure to export databaseConfig as a property of an object
module.exports = databaseConfigs;
