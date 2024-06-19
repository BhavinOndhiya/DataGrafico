const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database configuration
const dbPath = path.join(__dirname, '../schema/mydatabase.sqlite');
console.log("---------------------------------");
// Create a new SQLite database instance
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Database configuration
const databaseConfig = {
    client: 'sqlite',
    path: dbPath,
};

// Queries object containing SQL queries
const queries = {
    getCompanyInfoQuery: () => {
        return `
        SELECT * FROM company
        WHERE CIN = ?;
        `;
    },
    getCompanyInfoQueryMultiple: () => {
        return `
        SELECT * FROM company
        WHERE CIN IN (?);
        `;
    },
    getCompanyInfoWithDirectorsQuery: () => {
        return `
        SELECT company.*, group_concat(person.*) AS person
        FROM company
        LEFT JOIN person ON company.CIN = person.CIN
        WHERE company.CIN = ?
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
        company.cin;
        `;
    },
    getAllCompaniesQuery: (limit, offset) => {
        let query = `
        SELECT company.*, group_concat(person.*) AS person
        FROM company
        LEFT JOIN person ON company.CIN = person.CIN
        GROUP BY company.CIN`;
    
        if (limit) {
            query += ` LIMIT ${limit}`;
        }
    
        if (offset) {
            query += ` OFFSET ${offset}`;
        }
    
        return query;
    },
    getFilteredCompaniesQuery: (params, limit, offset, tableName) => {
        const conditions = [];
        const values = [];
    
        Object.keys(params).forEach((key, index) => {
            conditions.push(`${tableName}.${key} = $${index + 1}`);
            values.push(params[key]);
        });
    
        let query;
        if (tableName === "person") {
            query = `
                SELECT person.*
                FROM person
                ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
            `;
        } else {
            let personQuery = `SELECT CIN FROM person`;
    
            if (conditions.length > 0) {
                personQuery += ` WHERE ${conditions.join(' AND ')}`;
            }
    
            query = `
                SELECT company.*, (
                    SELECT group_concat(person.*) FROM person WHERE person.CIN = company.CIN
                ) AS person
                FROM company
                WHERE company.CIN IN (${personQuery})
            `;
        }
    
        if (limit) {
            query += ` LIMIT ${limit}`;
        }
    
        if (offset) {
            query += ` OFFSET ${offset}`;
        }
    
        return { query, values };
    },
    getCompanyFromDin: () => {
        return `
        SELECT * FROM person
        WHERE DIN = ?;
        `;
    },
    getCompanyFromDinMultiple: () => {
        return `
        SELECT * FROM person
        WHERE DIN IN (?);
        `;
    },
    getCompanyInfoByDateRangeQuery: () => {
        return `
        SELECT *
        FROM company
        WHERE DATE_OF_REGISTRATION BETWEEN ? AND ?;
        `;
    },
    searchCompany: (searchQuery) => {
        return {
            text: `
            SELECT *
            FROM company
            WHERE company_name LIKE ?
            LIMIT 20;
            `,
            values: [`%${searchQuery}%`]
        };
    },
};

// Export the database instance and queries so that they can be used in other files
module.exports = {
    db: db,
    databaseConfig: databaseConfig,
    queries: queries
};
