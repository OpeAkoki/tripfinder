// booking entity - calculates total price on creation
class Booking {
  constructor({ customerId, packageId, travellers, bookingDate, pricePerPerson }) {
    this.customerId = customerId;
    this.packageId = packageId;
    this.travellers = travellers;
    this.bookingDate = bookingDate;
    this.status = 'confirmed';
    this.totalPrice = this.computeTotal(pricePerPerson);
    this.pointsEarned = 0;
  }

  computeTotal(pricePerPerson) {
    return Number(pricePerPerson) * this.travellers;
  }
}

module.exports = Booking;
