// database queries for bookings
const pool = require('../config/db');

async function insert(b, client = pool) {
  const q = `INSERT INTO bookings
    (customer_id, package_id, travellers, booking_date, status, total_price, points_earned)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
  const v = [b.customerId, b.packageId, b.travellers, b.bookingDate,
             b.status, b.totalPrice, b.pointsEarned];
  const { rows } = await client.query(q, v);
  return rows[0];
}

async function findByCustomer(customerId) {
  const { rows } = await pool.query(
    'SELECT * FROM bookings WHERE customer_id=$1 ORDER BY created_at DESC',
    [customerId]);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM bookings WHERE id=$1', [id]);
  return rows[0];
}

async function update(id, fields, client = pool) {
  const { rows } = await client.query(
    'UPDATE bookings SET travellers=$1, booking_date=$2, total_price=$3, points_earned=$4 WHERE id=$5 RETURNING *',
    [fields.travellers, fields.bookingDate, fields.totalPrice, fields.pointsEarned, id]);
  return rows[0];
}

async function remove(id) {
  await pool.query('DELETE FROM bookings WHERE id=$1', [id]);
}

async function countTravellers(packageId, excludeBookingId = null, client = pool) {
  const { rows } = await client.query(
    `SELECT COALESCE(SUM(travellers), 0) AS total
     FROM bookings
     WHERE package_id = $1
       AND status != 'cancelled'
       AND ($2::int IS NULL OR id != $2)`,
    [packageId, excludeBookingId]
  );
  return Number(rows[0].total);
}

async function findAll() {
  const { rows } = await pool.query(
    `SELECT b.*, c.name AS customer_name, p.title AS package_title, p.departure_date AS package_departure_date
     FROM bookings b
     JOIN customers c ON c.id = b.customer_id
     JOIN packages  p ON p.id = b.package_id
     ORDER BY b.created_at DESC`
  );
  return rows;
}

module.exports = { insert, findByCustomer, findById, update, remove, findAll, countTravellers };
