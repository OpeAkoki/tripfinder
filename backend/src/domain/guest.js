// guest customer - no points earned
const Customer = require('./Customer');

class Guest extends Customer {
  earnPoints() { return 0; }
  canUpgrade() { return false; }
}

module.exports = Guest;
