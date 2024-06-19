const request = require('supertest');
const express = require('express');
const filtercompaniesRoute = require('../routes/filtercomapnies');

const app = express();
app.use(express.json());
app.use('/api/${API_VERSION}/filtercompanies', filtercompaniesRoute);

describe('Filter Companies API', () => {
  
    // Test case for successful filtering of companies based on parameters
  it('POST /api/v1/filtercompanies should return filtered companies', async () => {
    const filterParams = {
      "year":2022
    };

    const response = await request(app)
      .post('/api/v1/filtercompanies')
      .send(filterParams);      
      expect(response.body).toBeInstanceOf(Object); 
  });

  // Test case for no companies found based on provided parameters
  it('POST /api/v1/filtercompanies should return 404 when no companies are found', async () => {
    const filterParams = {
      "year":2530
    };

    const response = await request(app)
      .post('/api/v1/filtercompanies')
      .send(filterParams);
    expect(response.status).toBe(404);
  });
});