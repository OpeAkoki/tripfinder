// tests for login protection and role access

require('dotenv').config({ quiet: true, path: require('path').join(__dirname, '../.env') });
const request = require('supertest');
const app     = require('../src/app');

describe('Auth — protected routes', () => {
  test('GET /api/bookings without token returns 401', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(401);
  });

  test('GET /api/bookings/all without token returns 401', async () => {
    const res = await request(app).get('/api/bookings/all');
    expect(res.status).toBe(401);
  });

  test('GET /api/bookings/all with customer token returns 403', async () => {
    // Register then login as a plain customer
    const email = `rbac_test_${Date.now()}@test.com`;
    await request(app).post('/api/auth/register').send({
      name: 'RBAC Test', email, password: 'pass123', type: 'guest',
    });
    const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'pass123' });
    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/bookings/all')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);

    // Clean up
    const pool = require('../src/config/db');
    await pool.query('DELETE FROM customers WHERE email=$1', [email]);
  });
});
