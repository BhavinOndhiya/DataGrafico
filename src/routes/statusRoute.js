// routes/search.js

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../config/config');
const logger = require('../middleware/logger');

router.get('/', async (req, res) => {
    res.status(200).json({
            "status": "OK"
    });
});
module.exports = router;