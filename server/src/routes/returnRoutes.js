const express = require('express');
const { z } = require('zod');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { logSystemEvent } = require('../middleware/auditLogger');

const router = express.Router();

const returnSchema = z.object({
  order_id: z.number().int().positive(),
  item_name: z.string().min(1, 'Item name required'),
  quantity: z.number().int().positive().default(1),
  reason: z.string().min(3, 'Reason for return is required'),
  type: z.enum(['Refund', 'Exchange']).default('Refund'),
  photo_url: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

// POST /api/returns (Submit Return/Exchange Request)
router.post('/returns', authenticate, (req, res) => {
  try {
    const parseResult = returnSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.errors });
    }

    const { order_id, item_name, quantity, reason, type, photo_url, notes } = parseResult.data;

    const order = db.findOrderById(order_id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only request returns for your own orders.' });
    }

    if (order.status !== 'Completed') {
      return res.status(400).json({ message: 'Returns can only be requested for completed orders.' });
    }

    // Check return window eligibility (e.g. 7 days from order creation)
    const orderDate = new Date(order.updated_at || order.created_at);
    const now = new Date();
    const daysElapsed = (now - orderDate) / (1000 * 60 * 60 * 24);

    if (daysElapsed > 7) {
      return res.status(400).json({
        message: 'Return window expired. Returns must be requested within 7 days of order completion.'
      });
    }

    const newReturn = db.createReturn({
      order_id: order.id,
      order_number: order.order_number,
      user_id: req.user.id,
      user_name: req.user.name,
      item_name,
      quantity,
      reason,
      type,
      photo_url: photo_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      notes: notes || ''
    });

    logSystemEvent('RETURN_REQUESTED', `Return request ${newReturn.return_number} created for order #${order.order_number} (${type}: ${item_name})`, req);

    res.status(201).json({
      message: `${type} request submitted successfully and sent to store manager for review!`,
      return_request: newReturn
    });
  } catch (err) {
    console.error('Submit return error:', err);
    res.status(500).json({ message: 'Failed to submit return request.' });
  }
});

// GET /api/returns/my (Customer return history)
router.get('/returns/my', authenticate, (req, res) => {
  try {
    const allReturns = db.getReturns();
    const myReturns = allReturns
      .filter(r => r.user_id === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ returns: myReturns });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving return requests.' });
  }
});

// GET /api/returns (Staff/Admin return queue)
router.get('/returns', authenticate, requireRole(['STAFF', 'ADMIN']), (req, res) => {
  try {
    let returns = db.getReturns();
    const { status } = req.query;

    if (status) {
      returns = returns.filter(r => r.status === status);
    }

    returns.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ returns, count: returns.length });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving staff return queue.' });
  }
});

// PUT /api/returns/:id/process (Staff/Manager approve/reject)
router.put('/returns/:id/process', authenticate, requireRole(['STAFF', 'ADMIN']), (req, res) => {
  try {
    const { status, manager_notes, restock } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'Approved' or 'Rejected'." });
    }

    const returnId = Number(req.params.id);
    const updated = db.updateReturnStatus(returnId, status, manager_notes, !!restock);

    if (!updated) {
      return res.status(404).json({ message: 'Return request not found.' });
    }

    logSystemEvent('RETURN_PROCESSED', `Return #${updated.return_number} was ${status} by staff. Manager notes: '${manager_notes || 'N/A'}' (Restocked: ${!!restock})`, req);

    res.json({ message: `Return request ${status.toLowerCase()} successfully.`, return_request: updated });
  } catch (err) {
    console.error('Process return error:', err);
    res.status(500).json({ message: 'Failed to process return request.' });
  }
});

module.exports = router;
