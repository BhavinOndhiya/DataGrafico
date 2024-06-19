// routes/search.js

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../config/config');
const logger = require('../middleware/logger');

// Create a new Pool using both database and pool configurations from config.js
const pool = new Pool(config.database);

// Function to execute a SQL query with parameters
async function executeQuery(queryFunction, values) {
    const query = typeof queryFunction === 'function' ? queryFunction(values) : queryFunction;
    const result = await pool.query(query.text, query.values);
    return result.rows;
}

router.post('/', async (req, res) => {

    const token = req.get("X-RapidAPI-Proxy-Secret");
    if (token == null || token != process.env.TOKEN ) {
        logger.info('Token is required');
        return res.status(401).json({ error: 'Token is required' });
    } 
    try {
        // Extract the search query from the request body
        const { query } = req.body;

        // Handle special characters by removing them
        const sanitizedQuery = query.replace(/[^\w\s]/g, '');

        // Handle case for minimum length of company name
        if (sanitizedQuery.length < 3) {
            logger.info('Company name must be at least 3 characters long');
            return res.status(400).json({ error: 'Company name must be at least 3 characters long' });
        }

        // Split the search query by space to extract names
        const names = sanitizedQuery.split(' ');

        // Execute the SQL queries for searching companies based on each name
        const searchResults = [];
        for (const name of names) {
            const results = await executeQuery(config.queries.searchCompany, [`%${name}%`]);
            searchResults.push(...results);
        }

        // Check if no company is found
        if (searchResults.length === 0) {
            logger.info('No company found');
            return res.status(404).json({ error: 'No company found' });
        }
        // Send the search results as response with 200 OK status code
        res.status(200).json({
            "count": searchResults.rowCount,
            "result": searchResults.rows
        });
    } catch (error) {
        // Log the error using logger.info method
        logger.info('Error:', error);
        // Handle errors
        res.status(500).json({ error: 'An error occurred while searching' });
    }
});

module.exports = router;
