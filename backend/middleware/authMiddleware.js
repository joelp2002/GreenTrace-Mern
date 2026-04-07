const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized — invalid token' });
  }
};

/**
 * @param {...string} allowedRoles - ADMIN | FRU | NGP | MES
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Role ${req.user.role} is not allowed to perform this action`,
    });
  }

  next();
};

const canMutatePermits = authorize('FRU', 'MES');
const canAccessPermits = authorize('FRU', 'MES');
const canMutateSites = authorize('NGP', 'MES');
const canAccessSites = authorize('NGP', 'MES');
const canMutateSeedlings = authorize('NGP', 'MES');
const canAccessSeedlings = authorize('NGP', 'MES');
const canViewReports = authorize('MES');

module.exports = {
  protect,
  authorize,
  canAccessPermits,
  canMutatePermits,
  canAccessSites,
  canMutateSites,
  canAccessSeedlings,
  canMutateSeedlings,
  canViewReports,
};