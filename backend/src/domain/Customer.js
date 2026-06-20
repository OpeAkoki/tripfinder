// abstract customer class
class Customer {
  constructor({ id, name, email }) {
    if (new.target === Customer)
      throw new Error('Customer is abstract; create a Member or a Guest');
    this.id = id;
    this.name = name;
    this.email = email;
  }

  earnPoints(bookingTotal) { throw new Error('not implemented'); }
  canUpgrade(pointsBalance) { throw new Error('not implemented'); }
}

module.exports = Customer;
