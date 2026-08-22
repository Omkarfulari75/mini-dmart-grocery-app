const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const db = require('../config/db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const { logSystemEvent } = require('../middleware/auditLogger');

const router = express.Router();

// Input Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'STAFF', 'ADMIN']).optional().default('CUSTOMER')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstMsg = parseResult.error.errors[0]?.message || 'Validation error during registration';
      return res.status(400).json({ message: firstMsg, errors: parseResult.error.errors });
    }

    const { name, email, password, phone, role } = parseResult.data;

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = db.createUser({
      name,
      email,
      password: passwordHash,
      role: role || 'CUSTOMER',
      phone: phone || ''
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logSystemEvent('USER_REGISTERED', `New account registered as [${newUser.role}]: ${newUser.email}`, req);

    res.status(201).json({
      message: `Account registered successfully as '${newUser.role}'`,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstMsg = parseResult.error.errors[0]?.message || 'Validation error during login';
      return res.status(400).json({ message: firstMsg, errors: parseResult.error.errors });
    }

    const { email, password } = parseResult.data;
    const user = db.findUserByEmail(email);

    if (!user) {
      logSystemEvent('LOGIN_FAILED', `Failed login attempt for non-existent email: ${email}`, req);
      return res.status(401).json({ message: 'No account found with this email. Please register first.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      logSystemEvent('LOGIN_FAILED', `Invalid password attempt for account: ${email}`, req);
      return res.status(401).json({ message: 'Invalid password. Please check your password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logSystemEvent('USER_LOGIN_SUCCESS', `User ${user.email} logged in with role [${user.role}]`, req);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/demo-switch
router.post('/demo-switch', (req, res) => {
  const { role } = req.body;
  const targetEmail = role === 'ADMIN' ? 'admin@dmart.com' : role === 'STAFF' ? 'staff@dmart.com' : 'customer@dmart.com';
  
  const user = db.findUserByEmail(targetEmail);
  if (!user) {
    return res.status(404).json({ message: `Demo user for role ${role} not found` });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  logSystemEvent('DEMO_ROLE_SWITCH', `Switched active session to role: ${user.role}`, req);

  res.json({
    message: `Switched session to ${user.role} role`,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    }
  });
});

module.exports = router;
