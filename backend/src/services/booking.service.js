// handles all booking logic - create, read, update, cancel
const pool = require('../config/db');
const Booking = require('../domain/Booking');
const bookingRepo = require('../repositories/booking.repository');
const packageRepo = require('../repositories/package.repository');
const customerRepo = require('../repositories/customer.repository');

async function createBooking(customerId, dto) {
  const pkg = await packageRepo.findById(dto.packageId);
  if (!pkg) throw { status: 404, message: 'Package not found' };

  const seatsTaken = await bookingRepo.countTravellers(dto.packageId);
  const seatsLeft = pkg.capacity - seatsTaken;
  if (dto.travellers > seatsLeft)
    throw { status: 400, message: `Only ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left on this package` };

  // close bookings at 11:59pm the night before departure
  const cutoff = new Date(pkg.departure_date);
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(23, 59, 0, 0);
  if (new Date() >= cutoff)
    throw { status: 400, message: 'Bookings for this package are now closed.' };

  const customer = await customerRepo.findDomainById(customerId);
  if (!customer) throw { status: 404, message: 'Customer not found' };

  const booking = new Booking({
    customerId,
    packageId: dto.packageId,
    travellers: dto.travellers,
    bookingDate: dto.bookingDate,
    pricePerPerson: pkg.price_per_person
  });

  booking.pointsEarned = customer.earnPoints(booking.totalPrice);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const saved = await bookingRepo.insert(booking, client);
    if (booking.pointsEarned > 0)
      await customerRepo.addPoints(customerId, booking.pointsEarned, client);
    await client.query('COMMIT');
    return saved;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function listForCustomer(customerId) {
  return bookingRepo.findByCustomer(customerId);
}

async function getById(id) {
  const booking = await bookingRepo.findById(id);
  if (!booking) throw { status: 404, message: 'Booking not found' };
  return booking;
}

async function updateBooking(id, dto) {
  const existing = await bookingRepo.findById(id);
  if (!existing) throw { status: 404, message: 'Booking not found' };
  const pkg = await packageRepo.findById(existing.package_id);

  const seatsTaken = await bookingRepo.countTravellers(existing.package_id, id);
  const seatsLeft = pkg.capacity - seatsTaken;
  if (dto.travellers > seatsLeft)
    throw { status: 400, message: `Only ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left on this package` };

  const customer = await customerRepo.findDomainById(existing.customer_id);
  const newTotal = Number(pkg.price_per_person) * dto.travellers;
  const newPoints = customer.earnPoints(newTotal);
  const pointsDiff = newPoints - Number(existing.points_earned);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updated = await bookingRepo.update(id, {
      travellers: dto.travellers,
      bookingDate: dto.bookingDate,
      totalPrice: newTotal,
      pointsEarned: newPoints,
    }, client);
    if (pointsDiff !== 0)
      await customerRepo.addPoints(existing.customer_id, pointsDiff, client);
    await client.query('COMMIT');
    return updated;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function cancelBooking(id) {
  const existing = await bookingRepo.findById(id);
  if (!existing) throw { status: 404, message: 'Booking not found' };

  const pkg = await packageRepo.findById(existing.package_id);
  const cutoff = new Date(pkg.departure_date);
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(23, 59, 0, 0);
  if (new Date() >= cutoff)
    throw { status: 400, message: 'This booking can no longer be cancelled.' };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (existing.points_earned > 0)
      await customerRepo.addPoints(existing.customer_id, -existing.points_earned, client);
    await bookingRepo.remove(id);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function listAll() {
  return bookingRepo.findAll();
}

module.exports = { createBooking, listForCustomer, getById, updateBooking, cancelBooking, listAll };
