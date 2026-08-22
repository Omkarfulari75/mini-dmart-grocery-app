const db = require('../config/db');

function logSystemEvent(action, details, req = null) {
  const userId = req && req.user ? req.user.id : null;
  const userName = req && req.user ? req.user.name : 'SYSTEM';
  const userRole = req && req.user ? req.user.role : 'SYSTEM';
  const ipAddress = req ? (req.ip || req.connection.remoteAddress) : '127.0.0.1';

  return db.addAuditLog({
    user_id: userId,
    user_name: userName,
    user_role: userRole,
    action,
    details: typeof details === 'object' ? JSON.stringify(details) : details,
    ip_address: ipAddress
  });
}

module.exports = {
  logSystemEvent
};
