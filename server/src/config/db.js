const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '../../data');
const dataFilePath = path.join(dataDir, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let store = {
  users: [],
  categories: [],
  products: [],
  orders: [],
  returns: [],
  audit_logs: []
};

function loadStore() {
  if (fs.existsSync(dataFilePath)) {
    try {
      const rawData = fs.readFileSync(dataFilePath, 'utf8');
      store = JSON.parse(rawData);
      console.log('Loaded database store from file successfully.');
      return;
    } catch (err) {
      console.error('Error parsing database store file, initializing default seed...', err);
    }
  }
  seedDefaultData();
}

function saveStore() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save store to file:', err);
  }
}

function seedDefaultData() {
  console.log('Seeding default Mini D-Mart data...');

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Password123!', salt);

  // 1. Users
  store.users = [
    {
      id: 1,
      name: 'Rahul Customer',
      email: 'customer@dmart.com',
      password: passwordHash,
      role: 'CUSTOMER',
      phone: '+91 9876543210',
      created_at: new Date('2026-08-01T10:00:00Z').toISOString()
    },
    {
      id: 2,
      name: 'Priya Store Staff',
      email: 'staff@dmart.com',
      password: passwordHash,
      role: 'STAFF',
      phone: '+91 9876543211',
      created_at: new Date('2026-08-01T10:00:00Z').toISOString()
    },
    {
      id: 3,
      name: 'Vikram Admin',
      email: 'admin@dmart.com',
      password: passwordHash,
      role: 'ADMIN',
      phone: '+91 9876543212',
      created_at: new Date('2026-08-01T10:00:00Z').toISOString()
    }
  ];

  // 2. Categories
  store.categories = [
    { id: 1, name: 'Fresh Produce', slug: 'fresh-produce', icon: 'Apple', description: 'Fresh farm fruits & crisp vegetables' },
    { id: 2, name: 'Dairy & Bakery', slug: 'dairy-bakery', icon: 'Milk', description: 'Milk, cheese, butter, fresh bread & eggs' },
    { id: 3, name: 'Beverages', slug: 'beverages', icon: 'Coffee', description: 'Juices, soft drinks, tea, coffee & water' },
    { id: 4, name: 'Snacks & Munchies', slug: 'snacks', icon: 'Cookie', description: 'Chips, biscuits, nuts & packaged snacks' },
    { id: 5, name: 'Pantry & Staples', slug: 'pantry', icon: 'ShoppingBag', description: 'Rice, wheat flour, pulses, spices & oils' },
    { id: 6, name: 'Household Essentials', slug: 'household', icon: 'Home', description: 'Cleaning supplies, detergents & home care' }
  ];

  // 3. Products
  store.products = [
    {
      id: 1,
      name: 'Organic Royal Gala Apples',
      description: 'Crisp, sweet, and freshly picked imported Royal Gala apples. Packed with vitamins and antioxidant rich.',
      price: 180,
      discount_price: 149,
      category_id: 1,
      category_name: 'Fresh Produce',
      stock_quantity: 45,
      unit: '1 kg',
      image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      review_count: 84,
      is_pickup_eligible: 1,
      return_window_days: 3,
      created_at: new Date('2026-08-02T10:00:00Z').toISOString()
    },
    {
      id: 2,
      name: 'Fresh Farm Spinach (Palak)',
      description: 'Hydroponically grown pesticide-free spinach. High iron and essential nutrient content.',
      price: 40,
      discount_price: 29,
      category_id: 1,
      category_name: 'Fresh Produce',
      stock_quantity: 60,
      unit: '250 g',
      image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      rating: 4.6,
      review_count: 42,
      is_pickup_eligible: 1,
      return_window_days: 2,
      created_at: new Date('2026-08-02T10:00:00Z').toISOString()
    },
    {
      id: 3,
      name: 'Amul Taaza Toned Milk',
      description: 'Pasteurised toned milk with 3.0% fat and 8.5% SNF. Essential daily dairy for the family.',
      price: 64,
      discount_price: 62,
      category_id: 2,
      category_name: 'Dairy & Bakery',
      stock_quantity: 120,
      unit: '1 Litre',
      image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
      rating: 4.9,
      review_count: 210,
      is_pickup_eligible: 1,
      return_window_days: 1,
      created_at: new Date('2026-08-02T10:00:00Z').toISOString()
    },
    {
      id: 4,
      name: 'Artisan Whole Wheat Bread',
      description: 'Freshly baked 100% whole grain bread with multi-seeds. High fiber and no added preservatives.',
      price: 55,
      discount_price: 48,
      category_id: 2,
      category_name: 'Dairy & Bakery',
      stock_quantity: 35,
      unit: '400 g',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      rating: 4.7,
      review_count: 67,
      is_pickup_eligible: 1,
      return_window_days: 3,
      created_at: new Date('2026-08-02T10:00:00Z').toISOString()
    },
    {
      id: 5,
      name: 'Cold Pressed Orange Juice',
      description: '100% pure squeezed Valencia orange juice with natural pulp. Rich Vitamin C refresh.',
      price: 120,
      discount_price: 99,
      category_id: 3,
      category_name: 'Beverages',
      stock_quantity: 28,
      unit: '500 ml',
      image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      review_count: 53,
      is_pickup_eligible: 1,
      return_window_days: 5,
      created_at: new Date('2026-08-02T10:00:00Z').toISOString()
    },
    {
      id: 6,
      name: 'Premium Roasted Almonds',
      description: 'Lightly salted California almonds slow roasted to perfection. Healthy snack rich in vitamin E.',
      price: 350,
      discount_price: 299,
      category_id: 4,
      category_name: 'Snacks & Munchies',
      stock_quantity: 50,
      unit: '250 g',
      image_url: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=600&q=80',
      rating: 4.9,
      review_count: 115,
      is_pickup_eligible: 1,
      return_window_days: 7,
      created_at: new Date('2026-08-02T10:00:00Z').toISOString()
    },
    {
      id: 7,
      name: 'Basmati Rice Premium Extra Long',
      description: 'Aromatic long grain basmati rice, naturally aged for 2 years. Fluffy non-sticky grains.',
      price: 220,
      discount_price: 189,
      category_id: 5,
      category_name: 'Pantry & Staples',
      stock_quantity: 80,
      unit: '1 kg',
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      review_count: 94,
      is_pickup_eligible: 1,
      return_window_days: 7,
      created_at: new Date('2026-08-02T10:00:00Z').toISOString()
    },
    {
      id: 8,
      name: 'Organic Cold Pressed Mustard Oil',
      description: 'Traditional kachi ghani mustard oil. Pungent aroma and authentic traditional taste for gourmet cooking.',
      price: 210,
      discount_price: 185,
      category_id: 5,
      category_name: 'Pantry & Staples',
      stock_quantity: 40,
      unit: '1 Litre',
      image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
      rating: 4.6,
      review_count: 38,
      is_pickup_eligible: 1,
      return_window_days: 7,
      created_at: new Date('2026-08-02T10:00:00Z').toISOString()
    },
    {
      id: 9,
      name: 'Eco-Friendly Liquid Laundry Detergent',
      description: 'Tough on tough stains, gentle on clothes and environment. Plant-based non-toxic formula.',
      price: 450,
      discount_price: 380,
      category_id: 6,
      category_name: 'Household Essentials',
      stock_quantity: 30,
      unit: '1 Litre',
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
      rating: 4.7,
      review_count: 29,
      is_pickup_eligible: 1,
      return_window_days: 7,
      created_at: new Date('2026-08-02T10:00:00Z').toISOString()
    }
  ];

  // 4. Sample Orders
  store.orders = [
    {
      id: 1,
      order_number: 'ORD-98214',
      user_id: 1,
      user_name: 'Rahul Customer',
      user_email: 'customer@dmart.com',
      items: [
        { id: 1, name: 'Organic Royal Gala Apples', price: 149, quantity: 2, image_url: store.products[0].image_url },
        { id: 3, name: 'Amul Taaza Toned Milk', price: 62, quantity: 3, image_url: store.products[2].image_url }
      ],
      fulfillment_type: 'STORE_PICKUP',
      status: 'Ready for Pickup',
      pickup_branch: 'Mini D-Mart Express (Andheri East Branch)',
      scheduled_date: '2026-08-23',
      scheduled_slot: '10:00 AM - 12:00 PM',
      delivery_address: null,
      subtotal: 484,
      tax: 24.2,
      delivery_fee: 0,
      pickup_discount: 20,
      total_amount: 488.2,
      created_at: new Date('2026-08-22T09:30:00Z').toISOString(),
      updated_at: new Date('2026-08-22T10:15:00Z').toISOString()
    },
    {
      id: 2,
      order_number: 'ORD-98215',
      user_id: 1,
      user_name: 'Rahul Customer',
      user_email: 'customer@dmart.com',
      items: [
        { id: 6, name: 'Premium Roasted Almonds', price: 299, quantity: 1, image_url: store.products[5].image_url }
      ],
      fulfillment_type: 'HOME_DELIVERY',
      status: 'Completed',
      pickup_branch: null,
      scheduled_date: '2026-08-21',
      scheduled_slot: '02:00 PM - 04:00 PM',
      delivery_address: 'Flat 402, Sunshine Heights, MG Road, Mumbai',
      subtotal: 299,
      tax: 14.95,
      delivery_fee: 40,
      pickup_discount: 0,
      total_amount: 353.95,
      created_at: new Date('2026-08-21T08:00:00Z').toISOString(),
      updated_at: new Date('2026-08-21T15:00:00Z').toISOString()
    }
  ];

  // 5. Sample Returns
  store.returns = [
    {
      id: 1,
      return_number: 'RET-4401',
      order_id: 2,
      order_number: 'ORD-98215',
      user_id: 1,
      user_name: 'Rahul Customer',
      item_name: 'Premium Roasted Almonds',
      quantity: 1,
      reason: 'Packaging Damaged / Broken Seal',
      type: 'Refund',
      photo_url: 'https://images.unsplash.com/photo-1508061252966-17727ab83e89?auto=format&fit=crop&w=600&q=80',
      notes: 'Outer package seal was damaged when delivered.',
      status: 'Pending',
      manager_notes: null,
      created_at: new Date('2026-08-21T16:20:00Z').toISOString(),
      updated_at: new Date('2026-08-21T16:20:00Z').toISOString()
    }
  ];

  // 6. Audit Logs
  store.audit_logs = [
    {
      id: 1,
      user_id: 3,
      user_name: 'Vikram Admin',
      user_role: 'ADMIN',
      action: 'SYSTEM_BOOT',
      details: 'Mini D-Mart database store initialized with seed records.',
      ip_address: '127.0.0.1',
      created_at: new Date('2026-08-01T10:00:00Z').toISOString()
    }
  ];

  saveStore();
}

loadStore();

module.exports = {
  getStore: () => store,
  saveStore,
  
  // User Helpers
  getUsers: () => store.users,
  findUserByEmail: (email) => store.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id) => store.users.find(u => u.id === Number(id)),
  createUser: (user) => {
    const newUser = {
      id: store.users.length ? Math.max(...store.users.map(u => u.id)) + 1 : 1,
      ...user,
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);
    saveStore();
    return newUser;
  },
  updateUserRole: (id, newRole) => {
    const user = store.users.find(u => u.id === Number(id));
    if (user) {
      user.role = newRole;
      saveStore();
    }
    return user;
  },

  // Category & Product Helpers
  getCategories: () => store.categories,
  getProducts: () => store.products,
  findProductById: (id) => store.products.find(p => p.id === Number(id)),
  createProduct: (productData) => {
    const newProduct = {
      id: store.products.length ? Math.max(...store.products.map(p => p.id)) + 1 : 1,
      rating: 4.5,
      review_count: 0,
      is_pickup_eligible: 1,
      return_window_days: 7,
      created_at: new Date().toISOString(),
      ...productData
    };
    store.products.push(newProduct);
    saveStore();
    return newProduct;
  },
  updateProduct: (id, updates) => {
    const index = store.products.findIndex(p => p.id === Number(id));
    if (index !== -1) {
      store.products[index] = { ...store.products[index], ...updates };
      saveStore();
      return store.products[index];
    }
    return null;
  },
  deleteProduct: (id) => {
    const index = store.products.findIndex(p => p.id === Number(id));
    if (index !== -1) {
      const deleted = store.products.splice(index, 1);
      saveStore();
      return deleted[0];
    }
    return null;
  },

  // Order Helpers
  getOrders: () => store.orders,
  findOrderById: (id) => store.orders.find(o => o.id === Number(id)),
  createOrder: (orderData) => {
    const newOrder = {
      id: store.orders.length ? Math.max(...store.orders.map(o => o.id)) + 1 : 1,
      order_number: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Placed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...orderData
    };
    store.orders.push(newOrder);

    // Deduct stock for ordered items
    if (Array.isArray(newOrder.items)) {
      newOrder.items.forEach(item => {
        const prod = store.products.find(p => p.id === Number(item.id));
        if (prod) {
          prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
        }
      });
    }

    saveStore();
    return newOrder;
  },
  updateOrderStatus: (id, status) => {
    const order = store.orders.find(o => o.id === Number(id));
    if (order) {
      order.status = status;
      order.updated_at = new Date().toISOString();

      // If order is cancelled, restore product stock!
      if (status === 'Cancelled' && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const prod = store.products.find(p => p.id === Number(item.id));
          if (prod) {
            prod.stock_quantity += item.quantity;
          }
        });
      }

      saveStore();
    }
    return order;
  },

  // Return Helpers
  getReturns: () => store.returns,
  createReturn: (returnData) => {
    const newReturn = {
      id: store.returns.length ? Math.max(...store.returns.map(r => r.id)) + 1 : 1,
      return_number: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
      manager_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...returnData
    };
    store.returns.push(newReturn);
    saveStore();
    return newReturn;
  },
  updateReturnStatus: (id, status, manager_notes, restock = false) => {
    const ret = store.returns.find(r => r.id === Number(id));
    if (ret) {
      ret.status = status;
      ret.manager_notes = manager_notes || ret.manager_notes;
      ret.updated_at = new Date().toISOString();

      // If approved and restock is requested, increment stock
      if (status === 'Approved' && restock) {
        const prod = store.products.find(p => p.name === ret.item_name);
        if (prod) {
          prod.stock_quantity += ret.quantity;
        }
      }
      saveStore();
    }
    return ret;
  },

  // Audit Log Helpers
  getAuditLogs: () => store.audit_logs,
  addAuditLog: (logData) => {
    const newLog = {
      id: store.audit_logs.length ? Math.max(...store.audit_logs.map(l => l.id)) + 1 : 1,
      created_at: new Date().toISOString(),
      ...logData
    };
    store.audit_logs.unshift(newLog); // Put latest logs first
    if (store.audit_logs.length > 500) {
      store.audit_logs = store.audit_logs.slice(0, 500); // cap at 500 logs
    }
    saveStore();
    return newLog;
  }
};
