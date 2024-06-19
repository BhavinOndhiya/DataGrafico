const express = require('express');
const router = express.Router();
const config = require('../config/config');
const logger = require('../middleware/logger');
const { Pool } = require('pg');
const jwtAuthMiddleware = require('../middleware/Authentication'); // Import JWT authentication middleware
const databaseConnection = require('../middleware/databaseConnection');
const authenticateToken = require('../middleware/Authentication');

const pool = new Pool({
  ...config.database,
  ...config.pool,
  ssl: false
});

// Middleware for database connection
const connectToDatabase = databaseConnection(pool, logger);

// Route to get all companies based on date criteria using POST
router.post('/', authenticateToken,async (req, res, next) => { // Apply JWT authentication middleware
    const { startDate, endDate } = req.body;

    // Commented out the RapidAPI proxy part
    // const token = req.get("X-RapidAPI-Proxy-Secret");
    const token = process.env.TOKEN; // Get the token from environment variable
    // Check if the token is present and matches the hardcoded token
    if (!token || token !== process.env.HARDCODED_TOKEN) {
        logger.info('Token is required');
        return res.status(401).json({ error: 'Token is required' });
    } 
  
    try {  
      // Check if startDate and endDate are provided
      if (!startDate || !endDate) {
        logger.info('Both start date and end date are required.');
        return res.status(400).json({ error: 'Both start date and end date are required.' });
      }
  
      // Validate date format (assuming the format is 'DD/MM/YYYY')
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        logger.info('Invalid date format. Please use DD/MM/YYYY format.');
        return res.status(400).json({ error: 'Invalid date format. Please use DD/MM/YYYY format.' });
      }

      // Convert dates to ISO format ('YYYY-MM-DD') for SQL query
      const isoStartDate = new Date(startDate).toISOString().split('T')[0];
      const isoEndDate = new Date(endDate).toISOString().split('T')[0];
  
      // Get the query for retrieving companies by date range
      const query = config.queries.getCompanyInfoByDateRangeQuery();
  
      // Execute the query with parameters
      const result = await pool.query(query, [isoStartDate, isoEndDate]);
      
      // If no companies are found, return 404 Not Found error
      if (result.rows.length === 0) {
        logger.info('No companies registered between the provided date range.');
        return res.status(404).json({ message: 'No companies registered between the provided date range.' });
      }
      
      // Send the result back as a response
      res.status(200).json({
        "count": result.rowCount,
        "result": result.rows
      });

    } catch (error) {
      // Log the error using logger.info method
      logger.info('Error:', error);
  
      // Pass database errors to the global error handling middleware
      next(error);
    }
  });
  
  module.exports = router;
