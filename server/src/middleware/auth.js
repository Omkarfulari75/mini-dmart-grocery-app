const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'mini-dmart-secret-key-assessment-2026';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session token.' });
  }
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Log unauthorized access attempt to audit logs!
      db.addAuditLog({
        user_id: req.user.id,
        user_name: req.user.name,
        user_role: req.user.role,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        details: `Access denied to path ${req.originalUrl}. Required role: [${allowedRoles.join(', ')}]`,
        ip_address: req.ip || req.connection.remoteAddress
      });

      return res.status(403).json({
        message: `Forbidden: Access restricted. Role '${req.user.role}' is not authorized for this resource.`
      });
    }
    next();
  };
}

module.exports = {
  authenticate,
  requireRole,
  JWT_SECRET
};
