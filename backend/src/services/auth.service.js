// handles user registration and login
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const customerRepo = require('../repositories/customer.repository');

async function register({ name, email, password, type }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const customer = await customerRepo.insert({
    name, email, passwordHash,
    role: 'customer',
    type: type === 'member' ? 'member' : 'guest'
  });
  return { customer, token: sign(customer) };
}

async function login({ email, password }) {
  const row = await customerRepo.findRawByEmail(email);
  if (!row) throw { status: 401, message: 'Invalid credentials' };
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) throw { status: 401, message: 'Invalid credentials' };
  const customer = { id: row.id, name: row.name, email: row.email,
                     role: row.role, type: row.type, points_balance: row.points_balance };
  return { customer, token: sign(customer) };
}

function sign(c) {
  return jwt.sign({ id: c.id, role: c.role, type: c.type },
    process.env.JWT_SECRET, { expiresIn: '2h' });
}

module.exports = { register, login };
