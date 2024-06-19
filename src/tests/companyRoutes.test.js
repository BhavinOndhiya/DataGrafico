const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/companyRoutes'); // Update this with the path to your router file

// Mocking the database pool
// jest.mock('pg', () => ({
//   Pool: jest.fn(() => ({
//     query: jest.fn(),
//   })),
// }));

// // Mocking the configuration
// jest.mock('../config/config', () => ({
//   database: {
//     // Mock your database config here
//       user: process.env.DB_USER,
//       host: process.env.DB_HOST,
//       database: process.env.DB_DATABASE,
//       password: process.env.DB_PASSWORD,
//       port: process.env.DB_PORT,
//   },
//   queries: {
//     getCompanyInfoQuery: jest.fn(),
//     getCompanyInfoWithDirectorsQuery: jest.fn(),
//   },
// }));

// Set up Express app to use the router
app.use('/', router);

describe('GET /:cin', () => {
    it('should return 404 if CIN parameter is missing or empty', async () => {
        await request(app)
          .get('/')
          .expect(404)
    });
    
      it('GET /api/v1/company/:cin should return company details', async () => {
        const cin = "U98200UT2023PTC015565";
        const response = await request(app)
          .get(`/api/v1/company/${cin}`);
        expect(response.body).toBeInstanceOf(Object);
      });
      

  it('should return 500 if invalid value for include parameter', async () => {
    await request(app)
      .get('/123?include=invalid')
      .expect(500)
      .then((response) => {
        expect(response.body.error).toBe(
          'Invalid value for include parameter. Valid values are "directors" or empty.'
        );
      });
  });

  it('should return 404 if company not found', async () => {
    // Mocking a scenario where query result is empty
    const mockQuery = jest.fn().mockResolvedValueOnce({ rows: [] });
    const pool = require('pg').Pool;
    pool.prototype.query = mockQuery;

    await request(app)
      .get('/existing_cin')
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe('Company not found');
      });
  });

  it('should return 500 if database query fails', async () => {
    await request(app)
      .get('/THROW_DB_ERROR')
      .expect(500)
      .then((response) => {
        expect(response.body.error).toBe('Simulated DB query failure');
      });
  });
});
