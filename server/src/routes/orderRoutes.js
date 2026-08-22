const express = require('express');
const { z } = require('zod');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { logSystemEvent } = require('../middleware/auditLogger');

const router = express.Router();

const checkoutSchema = z.object({
  items: z.array(z.object({
    id: z.number().int().positive(),
    quantity: z.number().int().positive()
  })).min(1, 'Cart cannot be empty'),
  fulfillment_type: z.enum(['HOME_DELIVERY', 'STORE_PICKUP']),
  pickup_branch: z.string().optional().nullable(),
  scheduled_date: z.string().min(1, 'Scheduled date is required'),
  scheduled_slot: z.string().min(1, 'Scheduled time slot is required'),
  delivery_address: z.string().optional().nullable(),
  promo_code: z.string().optional().nullable()
});

// POST /api/orders (Create Order)
router.post('/orders', authenticate, (req, res) => {
  try {
    const parseResult = checkoutSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.errors });
    }

    const { items, fulfillment_type, pickup_branch, scheduled_date, scheduled_slot, delivery_address, promo_code } = parseResult.data;

    // Validate fulfillment rules
    if (fulfillment_type === 'HOME_DELIVERY' && (!delivery_address || delivery_address.trim().length < 5)) {
      return res.status(400).json({ message: 'A valid delivery address is required for Home Delivery.' });
    }
    if (fulfillment_type === 'STORE_PICKUP' && !pickup_branch) {
      return res.status(400).json({ message: 'Please select a Mini D-Mart pickup store branch.' });
    }

    // Validate stock and construct order items
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = db.findProductById(item.id);
      if (!product) {
        return res.status(400).json({ message: `Product #${item.id} not found.` });
      }

      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for '${product.name}'. Only ${product.stock_quantity} available in inventory.`
        });
      }

      if (fulfillment_type === 'STORE_PICKUP' && product.is_pickup_eligible === 0) {
        return res.status(400).json({
          message: `'${product.name}' is not eligible for store pickup. Please select Home Delivery.`
        });
      }

      const itemPrice = product.discount_price || product.price;
      subtotal += itemPrice * item.quantity;

      validatedItems.push({
        id: product.id,
        name: product.name,
        price: itemPrice,
        original_price: product.price,
        quantity: item.quantity,
        unit: product.unit,
        image_url: product.image_url
      });
    }

    // Taxes & Fees
    const tax = Math.round((subtotal * 0.05) * 100) / 100; // 5% GST
    let delivery_fee = fulfillment_type === 'HOME_DELIVERY' ? (subtotal > 500 ? 0 : 40) : 0;
    let pickup_discount = fulfillment_type === 'STORE_PICKUP' ? 20 : 0;

    let discount = 0;
    if (promo_code && promo_code.toUpperCase() === 'DMART10') {
      discount = Math.round(subtotal * 0.1); // 10% discount promo
    }

    const total_amount = Math.max(0, subtotal + tax + delivery_fee - pickup_discount - discount);

    const newOrder = db.createOrder({
      user_id: req.user.id,
      user_name: req.user.name,
      user_email: req.user.email,
      items: validatedItems,
      fulfillment_type,
      pickup_branch: fulfillment_type === 'STORE_PICKUP' ? pickup_branch : null,
      scheduled_date,
      scheduled_slot,
      delivery_address: fulfillment_type === 'HOME_DELIVERY' ? delivery_address : null,
      subtotal,
      tax,
      delivery_fee,
      pickup_discount,
      total_amount
    });

    logSystemEvent('ORDER_CREATED', `Order ${newOrder.order_number} created (${fulfillment_type}, Total: ₹${total_amount})`, req);

    res.status(201).json({
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'Failed to create order.' });
  }
});

// GET /api/orders/my (Customer's own orders)
router.get('/orders/my', authenticate, (req, res) => {
  try {
    const allOrders = db.getOrders();
    const myOrders = allOrders
      .filter(o => o.user_id === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ orders: myOrders });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user orders.' });
  }
});

// GET /api/orders (Staff/Admin - Filterable order list)
router.get('/orders', authenticate, requireRole(['STAFF', 'ADMIN']), (req, res) => {
  try {
    let orders = db.getOrders();
    const { status, fulfillment_type, search } = req.query;

    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (fulfillment_type) {
      orders = orders.filter(o => o.fulfillment_type === fulfillment_type);
    }
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(o => 
        o.order_number.toLowerCase().includes(q) ||
        o.user_name.toLowerCase().includes(q) ||
        o.user_email.toLowerCase().includes(q)
      );
    }

    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ orders, count: orders.length });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving staff orders.' });
  }
});

// PUT /api/orders/:id/status (Staff/Admin status transition)
router.put('/orders/:id/status', authenticate, requireRole(['STAFF', 'ADMIN']), (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Placed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const orderId = Number(req.params.id);
    const updated = db.updateOrderStatus(orderId, status);
    if (!updated) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    logSystemEvent('ORDER_STATUS_UPDATED', `Order #${updated.order_number} status changed to '${status}'`, req);

    res.json({ message: 'Order status updated successfully', order: updated });
  } catch (err) {
    console.error('Order status update error:', err);
    res.status(500).json({ message: 'Failed to update order status.' });
  }
});

// POST /api/orders/:id/cancel (Customer cancellation)
router.post('/orders/:id/cancel', authenticate, (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const order = db.findOrderById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.user_id !== req.user.id && !['STAFF', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You can only cancel your own orders.' });
    }

    if (['Completed', 'Cancelled', 'Out for Delivery', 'Ready for Pickup'].includes(order.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled as it is already in '${order.status}' stage.`
      });
    }

    const cancelledOrder = db.updateOrderStatus(orderId, 'Cancelled');
    logSystemEvent('ORDER_CANCELLED', `Order #${order.order_number} was cancelled by user. Stock restored.`, req);

    res.json({ message: 'Order cancelled successfully and inventory stock restored.', order: cancelledOrder });
  } catch (err) {
    console.error('Order cancellation error:', err);
    res.status(500).json({ message: 'Failed to cancel order.' });
  }
});

module.exports = router;
