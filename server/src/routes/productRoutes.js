const express = require('express');
const { z } = require('zod');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { logSystemEvent } = require('../middleware/auditLogger');

const router = express.Router();

// Product schema
const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  discount_price: z.number().optional(),
  category_id: z.number().int().positive('Category ID required'),
  category_name: z.string().optional(),
  stock_quantity: z.number().int().nonnegative('Stock quantity must be non-negative'),
  unit: z.string().default('1 unit'),
  image_url: z.string().url('Must be a valid image URL').or(z.string().min(1)),
  is_pickup_eligible: z.number().default(1),
  return_window_days: z.number().default(7)
});

// GET /api/categories
router.get('/categories', (req, res) => {
  const categories = db.getCategories();
  res.json({ categories });
});

// GET /api/products (with search, category, sort)
router.get('/products', (req, res) => {
  try {
    let products = db.getProducts();

    const { search, category, sort, stockOnly } = req.query;

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category_name && p.category_name.toLowerCase().includes(q))
      );
    }

    if (category) {
      products = products.filter(p => 
        p.category_name.toLowerCase() === category.toLowerCase() ||
        String(p.category_id) === String(category)
      );
    }

    if (stockOnly === 'true') {
      products = products.filter(p => p.stock_quantity > 0);
    }

    // Sorting
    if (sort === 'price-low') {
      products.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
    } else if (sort === 'price-high') {
      products.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
    } else if (sort === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    res.json({ products, count: products.length });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Error retrieving products.' });
  }
});

// GET /api/products/:id
router.get('/products/:id', (req, res) => {
  const product = db.findProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }
  res.json({ product });
});

// POST /api/products (Staff/Admin)
router.post('/products', authenticate, requireRole(['STAFF', 'ADMIN']), (req, res) => {
  try {
    const parseResult = productSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.errors });
    }

    const categories = db.getCategories();
    const cat = categories.find(c => c.id === parseResult.data.category_id);
    const category_name = cat ? cat.name : 'General';

    const newProduct = db.createProduct({
      ...parseResult.data,
      category_name
    });

    logSystemEvent('PRODUCT_CREATED', `Created new product: ${newProduct.name} (Stock: ${newProduct.stock_quantity})`, req);

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Failed to create product.' });
  }
});

// PUT /api/products/:id (Staff/Admin)
router.put('/products/:id', authenticate, requireRole(['STAFF', 'ADMIN']), (req, res) => {
  try {
    const productId = Number(req.params.id);
    const existing = db.findProductById(productId);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updated = db.updateProduct(productId, req.body);
    logSystemEvent('PRODUCT_UPDATED', `Updated product #${productId}: ${updated.name}`, req);

    res.json({ message: 'Product updated successfully', product: updated });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Failed to update product.' });
  }
});

// DELETE /api/products/:id (Admin only)
router.delete('/products/:id', authenticate, requireRole(['ADMIN']), (req, res) => {
  try {
    const productId = Number(req.params.id);
    const deleted = db.deleteProduct(productId);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    logSystemEvent('PRODUCT_DELETED', `Deleted product #${productId}: ${deleted.name}`, req);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Failed to delete product.' });
  }
});

module.exports = router;
