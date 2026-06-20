// package controller - CRUD for travel packages
const packageRepo = require('../repositories/package.repository');
const bookingRepo = require('../repositories/booking.repository');
const path = require('path');
const fs = require('fs');

async function list(req, res, next) {
  try {
    res.json(await packageRepo.findAll({
      destination: req.query.destination,
      maxPrice: req.query.maxPrice
    }));
  } catch (e) { next(e); }
}
async function getOne(req, res, next) {
  try {
    const pkg = await packageRepo.findById(Number(req.params.id));
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    const seatsTaken = await bookingRepo.countTravellers(pkg.id);
    res.json({ ...pkg, seats_left: pkg.capacity - seatsTaken });
  } catch (e) { next(e); }
}
async function create(req, res, next) {
  try { res.status(201).json(await packageRepo.insert(req.body)); }
  catch (e) { next(e); }
}
async function update(req, res, next) {
  try { res.json(await packageRepo.update(Number(req.params.id), req.body)); }
  catch (e) { next(e); }
}
async function remove(req, res, next) {
  try {
    const pkg = await packageRepo.findById(Number(req.params.id));
    if (pkg?.image_url?.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../../uploads', path.basename(pkg.image_url));
      fs.unlink(filePath, () => {});
    }
    await packageRepo.remove(Number(req.params.id));
    res.status(204).end();
  } catch (e) { next(e); }
}
module.exports = { list, getOne, create, update, remove };
