// auth controller - register, login and get current user
const authService = require('../services/auth.service');
const customerRepo = require('../repositories/customer.repository');

async function register(req, res, next) {
  try { res.status(201).json(await authService.register(req.body)); }
  catch (e) { next(e); }
}
async function login(req, res, next) {
  try { res.json(await authService.login(req.body)); }
  catch (e) { next(e); }
}
async function me(req, res, next) {
  try {
    const customer = await customerRepo.findById(req.user.id);
    if (!customer) return res.status(404).json({ message: 'User not found' });
    res.json(customer);
  } catch (e) { next(e); }
}
module.exports = { register, login, me };
