require('dotenv').config(); // Load environment variables from .env file
const { Pool } = require('pg');

// Database configuration
const databaseConfig = {
  // Retrieve variables from environment variables or .env file
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  client : 'postgresql',
//   ssl: {
//     require: true, 
//     rejectUnauthorized: false 
//   }
};

// Pool configurations
const pool = {
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000 // how long to wait when trying to connect to the database before throwing an error
};
console.log("Entered Postgresql");
console.log("------------********");

// Queries object containing SQL queries
const queries = {
  // Function to generate SQL query for fetching company information without directors
  getCompanyInfoQuery: () => {
    return `
      SELECT * FROM company
      WHERE CIN = $1
    `;
  },

  // Function to generate SQL query for fetching company information with directors (persons)
  getCompanyInfoQueryMultiple: () => {
    return `
      SELECT * FROM company
      WHERE CIN = ANY($1)
    `;
  },

  // Function to generate SQL query for fetching company information with directors
  getCompanyInfoWithDirectorsQuery: () => {
    return `
      SELECT company.*, json_agg(person.*) AS person
      FROM company
      LEFT JOIN person ON company.CIN = person.CIN
      WHERE company.CIN = $1
      GROUP BY company.authorized_capital,
      company.paidup_capital,
      company.date,
      company.no_members,
      company.company_reg_number,
      company.year,
      company.month,
      company.day,
      company.email,
      company.listed_flag,
      company.last_agm_date,
      company.balace_sheet_date,
      company.company_status,
      company.country,
      company.currency,
      company.registered_office_address,
      company.company_name,
      company.roc,
      company.category,
      company.sub_category,
      company.company_class,
      company.date_of_registration,
      company.cin
    `;
  },

  // Function to generate SQL query for fetching all companies with their directors
  getAllCompaniesQuery: (limit, offset) => {
    let query = `
      SELECT company.*, json_agg(person.*) AS person
      FROM company
      LEFT JOIN person ON company.CIN = person.CIN
      GROUP BY company.CIN
    `;
  
    if (limit) {
      query += ` LIMIT $${limit}`;
    }
  
    if (offset) {
      query += ` OFFSET $${offset}`;
    }
  
    return query;
  },

  // Function to generate SQL query for filtering companies based on parameters
  getFilteredCompaniesQuery: (params, limit, offset, tableName) => {
    // Initialize arrays to store conditions and parameter values
    const conditions = [];
    const values = [];

    // Iterate over the parameters and build the conditions for searching in the specified table
    Object.keys(params).forEach((key, index) => {
        conditions.push(`${tableName}.${key} = $${index + 1}`);
        values.push(params[key]);
    });

    // Construct the query based on the specified table
    let query;
    if (tableName === "person") {
        query = `
            SELECT person.*
            FROM person
            ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
        `;
    } else {
        // Construct the query to search in the 'company' table based on the 'cin' obtained from the 'person' table
        let personQuery = `SELECT CIN FROM person`;

        // Add WHERE clause if there are conditions for searching in the 'person' table
        if (conditions.length > 0) {
            personQuery += ` WHERE ${conditions.join(' AND ')}`;
        }

        query = `
            SELECT company.*, (
                SELECT json_agg(person.*) FROM person WHERE person.CIN = company.CIN
            ) AS person
            FROM company
            WHERE company.CIN IN (${personQuery})
        `;
    }

    if (limit) {
      query += ` LIMIT $${limit}`;
    }

    if (offset) {
      query += ` OFFSET $${offset}`;
    }

    // Return the final query and parameter values
    return { query, values };
  },

  // Function to generate SQL query for fetching company information by date range
  getCompanyInfoByDateRangeQuery: () => {
    return `
      SELECT *
      FROM company
      WHERE DATE_OF_REGISTRATION BETWEEN $1::DATE AND $2::DATE;
    `;
  },

  // Function to generate SQL query for searching companies by name
  searchCompany: (searchQuery) => {
    return {
      text: `
        SELECT *
        FROM company
        WHERE company_name ILIKE $1
        LIMIT 20;
      `,
      values: [`%${searchQuery}%`]
    };
  },

  // Function to generate SQL query for fetching company information from DIN
  getCompanyFromDin: () => {
    return `
      SELECT * FROM person
      WHERE DIN = $1
    `;
  },

  // Function to generate SQL query for fetching company information from multiple DINs
  getCompanyFromDinMultiple: () => {
    return `
      SELECT * FROM person
      WHERE DIN = ANY($1)
    `;
  },
};

// Export configuration object containing database connection details and queries
module.exports = {
  pool: pool,
  databaseConfig: databaseConfig,
  queries: queries
};
