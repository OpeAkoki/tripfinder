// member customer - earns loyalty points
const Customer = require('./Customer');

class Member extends Customer {
  earnPoints(bookingTotal) { return Math.floor(bookingTotal / 100); } // 1pt per £100
  canUpgrade(pointsBalance) { return pointsBalance >= 500; }
}

module.exports = Member;
