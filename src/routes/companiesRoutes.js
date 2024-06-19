const express = require('express');
const router = express.Router();
const config = require('../config/config');
const logger = require('../middleware/logger');
const { Pool } = require('pg');

// Create a new Pool using both database and pool configurations from config.js
const pool = new Pool(config.database);
// const pool = new Pool({
//     ...config.database,
//     ...config.pool,
//     ssl: false
//   });

// Route to get company information by multiple CINs using POST
router.post('/', async (req, res, next) => {

    // Commented out the RapidAPI proxy part
    const token = req.get("X-RapidAPI-Proxy-Secret");
    // const token = process.env.HARDCODED_TOKEN; // Get the token from environment variable
    // Check if the token is present and matches the hardcoded token
    if (!token || token !== process.env.TOKEN) {
        logger.info('Token is required');
        return res.status(401).json({ error: 'Token is required' });
    } 

    const cinArray = req.body;
    try {

    // Check if any individual CIN is empty or null
    if (cinArray.some(cin => !cin.trim()|| !isValidCINFormat(cin))) {
        logger.info('One or more CINs are invalid');
        return res.status(500).json({ error: 'One or more CINs are invalid' });
    }

    // Function to validate the CIN format
    function isValidCINFormat(cin) {
       const regex = /^[A-Za-z]\d{5}[A-Za-z]{2}\d{4}[A-Za-z]{3}\d{6}$/;
       return regex.test(cin);
    }

    // Check if any CIN is a special value indicating a database query failure
   if (cinArray.includes('THROW_DB_ERROR')) {
    // Simulate a database query failure by intentionally throwing an error
    logger.info('Simulated DB query failure');
    throw new Error('Simulated DB query failure');
    }

    // Set the query
    const query = config.queries.getCompanyInfoQueryMultiple();

    // Execute the query for all CINs in the array
    const result = await pool.query(query, [cinArray]);

    // Check if there is data in the result
    if (!result || result.rows.length === 0) {
        logger.info('One or more companies with the given CINs not found');
        // If no data, send a 404 Not Found status
        return res.status(404).json({ message: 'One or more companies with the given CINs not found' });
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
