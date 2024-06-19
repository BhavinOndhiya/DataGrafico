const express = require('express');
const router = express.Router();
const config = require('../config/config');
const logger = require('../middleware/logger');
const { Pool } = require('pg');

// Create a new Pool using both database and pool configurations from config.js
const pool = new Pool(config.database);

// Route to fiter companies based on parameters using POST
router.post('/', async (req, res, next) => {

    const token = req.get("X-RapidAPI-Proxy-Secret");
    if (token == null || token != process.env.TOKEN ) {
        logger.info('Token is required');
        return res.status(401).json({ error: 'Token is required' });
    } 
    try {
        const params = req.body ;
        const page = req.query.page || 1; // default to page 1 if not specified
        const pageSize = req.query.pageSize || 10; // default to 10 items per page
        const tablename = req.query.type //get table name from which have to fetch parameters

        // Calculate offset based on page and pageSize
        const offset = (page - 1) * pageSize;

    // Check if there are parameters
    if (Object.keys(params).length === 0) {
      const allCompaniesQuery = config.queries.getAllCompaniesQuery(pageSize, offset);
      const allCompaniesResult = await pool.query(allCompaniesQuery);

      if (!allCompaniesResult || allCompaniesResult.rows.length === 0) {
        logger.info('No companies found');
        return res.status(404).json({ message: 'No companies found' });
      }

      res.status(200).json({
        "count": allCompaniesResult.rowCount,
        "result": allCompaniesResult.rows
      });
    }

    // Generate dynamic query and values
    const { query: filterQuery, values } = config.queries.getFilteredCompaniesQuery(params, pageSize, offset,tablename);

    // Execute the query with the specified parameters
    const filteredCompaniesResult = await pool.query(filterQuery, values);

    if (!filteredCompaniesResult || filteredCompaniesResult.rows.length === 0) {
      logger.info('No companies found based on the provided parameters');
      return res.status(404).json({ message: 'No companies found based on the provided parameters' });
    }

    return res.status(200).json(filteredCompaniesResult.rows);
    } catch (error) {
        // Pass database errors to the global error handling middleware
        // Log the error using logger.info method
      logger.info('Error:', error);
        next(error);
    }

});

module.exports = router;