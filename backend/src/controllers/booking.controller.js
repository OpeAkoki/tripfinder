// booking controller - passes requests to the service layer
const service = require('../services/booking.service');

async function create(req, res, next) {
  try {
    const booking = await service.createBooking(req.user.id, req.body);
    res.status(201).json(booking);
  } catch (e) { next(e); }
}
async function list(req, res, next) {
  try { res.json(await service.listForCustomer(req.user.id)); }
  catch (e) { next(e); }
}
async function getOne(req, res, next) {
  try { res.json(await service.getById(Number(req.params.id))); }
  catch (e) { next(e); }
}
async function update(req, res, next) {
  try { res.json(await service.updateBooking(Number(req.params.id), req.body)); }
  catch (e) { next(e); }
}
async function cancel(req, res, next) {
  try { await service.cancelBooking(Number(req.params.id)); res.status(204).end(); }
  catch (e) { next(e); }
}
async function listAll(req, res, next) {
  try { res.json(await service.listAll()); }
  catch (e) { next(e); }
}

module.exports = { create, list, getOne, update, cancel, listAll };
