// database queries for customers
const pool = require('../config/db');
const Member = require('../domain/Member');
const Guest = require('../domain/Guest');

async function findRawByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM customers WHERE email=$1', [email]);
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, type, points_balance FROM customers WHERE id=$1', [id]);
  return rows[0];
}

// returns a Member or Guest object so earnPoints can be called without type checks
async function findDomainById(id) {
  const row = await findById(id);
  if (!row) return null;
  const data = { id: row.id, name: row.name, email: row.email };
  return row.type === 'member' ? new Member(data) : new Guest(data);
}

async function insert(c, client = pool) {
  const { rows } = await client.query(
    `INSERT INTO customers (name, email, password_hash, role, type)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, name, email, role, type, points_balance`,
    [c.name, c.email, c.passwordHash, c.role || 'customer', c.type || 'guest']);
  return rows[0];
}

async function addPoints(id, points, client = pool) {
  await client.query(
    'UPDATE customers SET points_balance = points_balance + $1 WHERE id=$2',
    [points, id]);
}

module.exports = { findRawByEmail, findById, findDomainById, insert, addPoints };
