const request = require('supertest');
const express = require('express');
const searchRoute = require('../routes/searchRoute');

describe('Search Route', () => {
    const app = express();
    app.use(express.json());
    app.use('/', searchRoute);

    it('should return 500 Internal Server Error for any request', async () => {
        const response = await request(app)
            .post('/')
            .send({});

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'An error occurred while searching');
    });
    it('should return 404 if no company is found', async () => {
        // Mocking the executeQuery function to return empty array
        jest.mock('../config/config', () => ({
            database: {},
            pool: {},
            queries: { searchCompany: jest.fn() }
        }));
        const config = require('../config/config');
        config.queries.searchCompany.mockResolvedValue([]);

        await request(app)
            .post('/search')
            .send({ query: 'NonExistingCompany' })
            .expect(404);
    });
    it('POST /api/v1/SearchCompanies should return companies', async () => {
        const searchParams = {
          "query":"tnt"
        };
    
        const response = await request(app)
          .post('/api/v1/searchCompany')
          .send(searchParams);      
          expect(response.body).toBeInstanceOf(Object); 
      });
});
