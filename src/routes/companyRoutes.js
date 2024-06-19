const express = require('express');
const router = express.Router();
const config = require('../config/config');
const logger = require('../middleware/logger');
const sqlite_config = require('../config/sqlite_config');
const postgresql_config = require('../config/postgresql_config');

let pool; // Define the pool variable
let userdbpath;
// Check the database type and set up the pool accordingly
//console.log('Database client:', sqlite_config.databaseConfig.client);

// if (sqlite_config.databaseConfig.client === 'sqlite') {
//     //console.log("Using SQLite database configuration...");
//     const { db, queries } = sqlite_config;
//     //console.log("Loaded SQLite queries:", queries);
//     userdbpath = sqlite_config;
//     // console.log(sqlite_config.db);
//     pool = db;
//     // sqlite_config.queries = queries;
// } else 
    if (postgresql_config.databaseConfig.client === 'postgresql') {
    console.log("PostGreeeeSQQQQQl");
    // Load PostgreSQL-specific configurations and queries
    const { Pool } = require('pg');
    // pool = new Pool(config.database);
    pool = new Pool({
    ...postgresql_config.databaseConfig,
    ...postgresql_config.poolConfig,
    ssl: false
  });
  userdbpath = postgresql_config;
} else {
    // Handle unsupported database types
    throw new Error('Unsupported database type');
}

// Route to get company information by CIN
router.get('/:cin', async (req, res, next) => {
    const { cin } = req.params;
    const { include } = req.query;

    try {
        // Check if CIN is empty or null
        if (!cin) {
            logger.info('CIN parameter is missing or empty');
            return res.status(404).json({ error: 'CIN parameter is missing or empty' });
        }

        // Determine the query to use based on the 'include' parameter
        let query;
        console.log(userdbpath);
        switch (include) {
            case 'directors':
                query = userdbpath.queries.getCompanyInfoWithDirectorsQuery();
                break;
            case undefined:
            case null:
            case '':
                query = userdbpath.queries.getCompanyInfoQuery();
                break;
            default:
                logger.info('Invalid value for include parameter. Valid values are "directors" or empty.');
                return res.status(500).json({ error: 'Invalid value for include parameter. Valid values are "directors" or empty.' });
        }
        // Check if the CIN is a special value indicating a database query failure
        if (cin === 'THROW_DB_ERROR') {
            // Simulate a database query failure by returning a 500 status code
            logger.info('Simulated DB query failure');
            return res.status(500).json({ error: 'Simulated DB query failure' });
        }

        // Execute the query
        console.log("Query-----"+query, [cin]);
        const result = await pool.query(query, [cin]);
        // const result = await pool.all(query, [cin]);
        // Log the result with properties expanded
        console.log("*****");
        console.dir(result);


        // Check if there is data in the result
        if (!result || result.rows.length === 0) {
            logger.info('Company not found');
            // If no data, send a 404 Not Found status
            return res.status(404).json({ message: 'Company not found' });
        }

        // Send the result as JSON response
        res.status(200).json({
            "count": result.rowCount,
            "result": result.rows
        });
    } catch (error) {
        // Pass database errors to the global error handling middleware
        // Log the error using logger.info method
        logger.info('Error:', error);
        next(error);
    }
});

module.exports = router;
