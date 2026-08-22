const express = require('express');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { logSystemEvent } = require('../middleware/auditLogger');

const router = express.Router();

// GET /api/admin/metrics
router.get('/admin/metrics', authenticate, requireRole(['STAFF', 'ADMIN']), (req, res) => {
  try {
    const orders = db.getOrders();
    const products = db.getProducts();
    const returns = db.getReturns();
    const users = db.getUsers();

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'Completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const pendingPickups = orders.filter(o => o.fulfillment_type === 'STORE_PICKUP' && ['Placed', 'Preparing', 'Ready for Pickup'].includes(o.status)).length;
    const pendingDeliveries = orders.filter(o => o.fulfillment_type === 'HOME_DELIVERY' && ['Placed', 'Preparing', 'Out for Delivery'].includes(o.status)).length;
    const pendingReturns = returns.filter(r => r.status === 'Pending').length;
    const lowStockProducts = products.filter(p => p.stock_quantity <= 10).length;

    res.json({
      metrics: {
        totalOrders,
        completedOrdersCount: completedOrders.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingPickups,
        pendingDeliveries,
        pendingReturns,
        totalProducts: products.length,
        lowStockProducts,
        totalUsers: users.length
      }
    });
  } catch (err) {
    console.error('Metrics error:', err);
    res.status(500).json({ message: 'Failed to fetch metrics.' });
  }
});

// GET /api/admin/users
router.get('/admin/users', authenticate, requireRole(['ADMIN']), (req, res) => {
  try {
    const users = db.getUsers().map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      created_at: u.created_at
    }));
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user list.' });
  }
});

// PUT /api/admin/users/:id/role
router.put('/admin/users/:id/role', authenticate, requireRole(['ADMIN']), (req, res) => {
  try {
    const { role } = req.body;
    if (!['CUSTOMER', 'STAFF', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const userId = Number(req.params.id);
    const targetUser = db.findUserById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const oldRole = targetUser.role;
    const updated = db.updateUserRole(userId, role);

    logSystemEvent('USER_ROLE_CHANGED', `User ${targetUser.email} role updated from [${oldRole}] to [${role}] by Admin`, req);

    res.json({
      message: `User role updated to ${role} successfully.`,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role
      }
    });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ message: 'Failed to update user role.' });
  }
});

// GET /api/admin/audit-logs
router.get('/admin/audit-logs', authenticate, requireRole(['ADMIN']), (req, res) => {
  try {
    let logs = db.getAuditLogs();
    const { search } = req.query;

    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l => 
        l.action.toLowerCase().includes(q) ||
        (l.user_name && l.user_name.toLowerCase().includes(q)) ||
        (l.details && l.details.toLowerCase().includes(q))
      );
    }

    res.json({ audit_logs: logs, count: logs.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs.' });
  }
});

module.exports = router;
