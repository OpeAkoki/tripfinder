// checks JWT token and user role on protected routes
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: 'Invalid token' }); }
}

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next()
    : res.status(403).json({ message: 'Forbidden' });

module.exports = { authenticate, requireRole };
