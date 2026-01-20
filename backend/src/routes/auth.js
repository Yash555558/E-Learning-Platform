const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Signup
router.post(
  '/signup',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, email, password } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, passwordHash });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production', 
        sameSite: 'none',
        domain: process.env.COOKIE_DOMAIN || undefined
      });
      res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) { next(err); }
  }
);

// Login
router.post('/login', body('email').isEmail(), body('password').exists(), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production', 
      sameSite: 'none',
      domain: process.env.COOKIE_DOMAIN || undefined
    });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
});

router.get('/me', async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(200).json({ user: null });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-passwordHash');
    res.json({ user });
  } catch (err) {
    res.status(200).json({ user: null });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { 
    httpOnly: true, 
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production', 
    sameSite: 'none',
    domain: process.env.COOKIE_DOMAIN || undefined
  });
  res.json({ ok: true });
});

module.exports = router;