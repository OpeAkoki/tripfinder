// database queries for packages
const pool = require('../config/db');

async function findAll(filters = {}) {
  const clauses = [];
  const values = [];
  if (filters.destination) {
    values.push(`%${filters.destination}%`);
    clauses.push(`destination ILIKE $${values.length}`);
  }
  if (filters.maxPrice) {
    values.push(filters.maxPrice);
    clauses.push(`price_per_person <= $${values.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT * FROM packages ${where} ORDER BY departure_date`, values);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM packages WHERE id=$1', [id]);
  return rows[0];
}

async function insert(p) {
  const { rows } = await pool.query(
    `INSERT INTO packages
      (title, destination, description, price_per_person, departure_date, capacity, image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [p.title, p.destination, p.description,
     p.price_per_person ?? p.pricePerPerson,
     p.departure_date ?? p.departureDate,
     p.capacity,
     p.image_url ?? p.imageUrl ?? '']);
  return rows[0];
}

async function update(id, p) {
  const { rows } = await pool.query(
    `UPDATE packages SET title=$1, destination=$2, description=$3,
      price_per_person=$4, departure_date=$5, capacity=$6, image_url=$7
     WHERE id=$8 RETURNING *`,
    [p.title, p.destination, p.description,
     p.price_per_person ?? p.pricePerPerson,
     p.departure_date ?? p.departureDate,
     p.capacity,
     p.image_url ?? p.imageUrl ?? '',
     id]);
  return rows[0];
}

async function remove(id) {
  await pool.query('DELETE FROM packages WHERE id=$1', [id]);
}

module.exports = { findAll, findById, insert, update, remove };
