const jwt = require('jsonwebtoken');
const User = require('../models/User');

function auth(requiredRole) {
  return async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    try {
      const token = header.slice(7);
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      if (requiredRole) {
        const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowed.includes(user.role)) {
          return res.status(403).json({ message: 'Forbidden' });
        }
      }
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

module.exports = { auth };