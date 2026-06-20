// tests for Member and Guest - earning points and upgrade eligibility

const Member = require('../src/domain/member');
const Guest  = require('../src/domain/guest');

const memberData = { id: 1, name: 'Ada Test', email: 'ada@test.com' };
const guestData  = { id: 2, name: 'Tom Test', email: 'tom@test.com' };

describe('GRASP Polymorphism — earnPoints', () => {
  test('Member earns 1 point per £100 spent', () => {
    const member = new Member(memberData);
    expect(member.earnPoints(900)).toBe(9);
  });

  test('Guest always earns 0 points regardless of total', () => {
    const guest = new Guest(guestData);
    expect(guest.earnPoints(900)).toBe(0);
  });

  test('Member earns correct points for large booking (£2100 → 21 pts)', () => {
    const member = new Member(memberData);
    expect(member.earnPoints(2100)).toBe(21);
  });

  test('Guest earns 0 even on a large booking', () => {
    const guest = new Guest(guestData);
    expect(guest.earnPoints(2100)).toBe(0);
  });

  test('same method call, different results — polymorphism in action', () => {
    const customers = [new Member(memberData), new Guest(guestData)];
    const [memberPts, guestPts] = customers.map(c => c.earnPoints(1000));
    expect(memberPts).toBe(10);  // Member: 1000 / 100 = 10
    expect(guestPts).toBe(0);    // Guest:  always 0
  });
});

describe('GRASP Polymorphism — canUpgrade', () => {
  test('Member can upgrade at 500+ points', () => {
    const member = new Member(memberData);
    expect(member.canUpgrade(500)).toBe(true);
    expect(member.canUpgrade(499)).toBe(false);
  });

  test('Guest can never upgrade', () => {
    const guest = new Guest(guestData);
    expect(guest.canUpgrade(9999)).toBe(false);
  });
});
