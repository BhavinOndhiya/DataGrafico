const express = require('express');
const router = express.Router();
const config = require('../config/config');
const logger = require('../middleware/logger');
const { Pool } = require('pg');

const pool = new Pool(config.database);

// const pool = new Pool({
//     ...config.database,
//     ...config.pool,
//     ssl: false
//   });

// Route to get company information by single DIN using GET
router.get('/:din', async (req, res, next) => {
    const { din } = req.params;

    // Commented out the RapidAPI proxy part
    const token = req.get("X-RapidAPI-Proxy-Secret");
    // const token = process.env.HARDCODED_TOKEN; // Get the token from environment variable
    // Check if the token is present and matches the hardcoded token
    if (!token || token !== process.env.TOKEN) {
        logger.info('Token is required');
        return res.status(401).json({ error: 'Token is required' });
    } 

    try {
        // Check if the DIN is empty or null
        if (!din.trim() || !isValidDINFormat(din)) {
            logger.info('Invalid DIN');
            return res.status(400).json({ error: 'Invalid DIN' });
        }

        // Function to validate the DIN format
        function isValidDINFormat(din) {
            const regex = /^[0-9A-Z]{10}$/;
            return regex.test(din);
        }

        // Check if the DIN is a special value indicating a database query failure
        if (din === 'THROW_DB_ERROR') {
            // Simulate a database query failure by intentionally throwing an error
            throw new Error('Simulated DB query failure');
        }

        // Set the query
        const query = config.queries.getCompanyFromDin();

        // Execute the query for the single DIN
        const result = await pool.query(query, [din]);

        // Check if there is data in the result
        if (!result || result.rows.length === 0) {
            logger.info('Company with the given DIN not found');
            // If no data, send a 404 Not Found status
            return res.status(404).json({ message: 'Company with the given DIN not found' });
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
