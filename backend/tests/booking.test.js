// booking API tests - create, read, update and delete

require('dotenv').config({ quiet: true, path: require('path').join(__dirname, '../.env') });
const request = require('supertest');
const app     = require('../src/app');
const pool    = require('../src/config/db');

const TEST_EMAIL = 'jest_booking_test@test.com';
let token;
let bookingId;
let packageId;

beforeAll(async () => {
  // Remove any leftover test data from a previous run
  await pool.query('DELETE FROM bookings WHERE customer_id IN (SELECT id FROM customers WHERE email=$1)', [TEST_EMAIL]);
  await pool.query('DELETE FROM customers WHERE email=$1', [TEST_EMAIL]);

  // Register a member test account
  await request(app).post('/api/auth/register').send({
    name: 'Jest Tester', email: TEST_EMAIL, password: 'pass123', type: 'member',
  });

  // Login and store the JWT
  const res = await request(app).post('/api/auth/login').send({ email: TEST_EMAIL, password: 'pass123' });
  token = res.body.token;

  // Grab the first available package
  const pkgRes = await request(app).get('/api/packages');
  packageId = pkgRes.body[0].id;
});

afterAll(async () => {
  // Clean up test bookings and account
  await pool.query('DELETE FROM bookings WHERE customer_id IN (SELECT id FROM customers WHERE email=$1)', [TEST_EMAIL]);
  await pool.query('DELETE FROM customers WHERE email=$1', [TEST_EMAIL]);
  await pool.end();
});

describe('Booking CRUD', () => {
  test('CREATE — POST /api/bookings creates a confirmed booking', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingDate = tomorrow.toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ packageId, travellers: 2, bookingDate });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('confirmed');
    expect(Number(res.body.total_price)).toBeGreaterThan(0);
    bookingId = res.body.id;
  });

  test('CREATE — Member booking earns points (1 pt per £100)', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${token}`);

    const booking = res.body.find(b => b.id === bookingId);
    expect(booking).toBeDefined();
    const expectedPoints = Math.floor(Number(booking.total_price) / 100);
    expect(Number(booking.points_earned)).toBe(expectedPoints);
  });

  test('READ — GET /api/bookings returns the booking', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find(b => b.id === bookingId);
    expect(found).toBeDefined();
  });

  test('UPDATE — PUT /api/bookings/:id changes traveller count', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingDate = tomorrow.toISOString().split('T')[0];

    const res = await request(app)
      .put(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ packageId, travellers: 3, bookingDate });

    expect(res.status).toBe(200);
    expect(Number(res.body.travellers)).toBe(3);
  });

  test('DELETE — DELETE /api/bookings/:id cancels the booking', async () => {
    const res = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  test('READ after cancel — booking no longer accessible', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${token}`);

    const found = res.body.find(b => b.id === bookingId);
    expect(found).toBeUndefined();
  });
});
