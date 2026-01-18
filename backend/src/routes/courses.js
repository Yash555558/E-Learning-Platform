const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/courses
router.get('/', async (req, res, next) => {
  try {
    const { category, difficulty, search, page = 1, limit = 10 } = req.query;
    const q = {};
    if (category) q.category = category;
    if (difficulty) q.difficulty = difficulty;
    if (search) q.title = { $regex: search, $options: 'i' };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Course.countDocuments(q);
    const courses = await Course.find(q).sort('-createdAt').skip(skip).limit(parseInt(limit));
    
    res.json({ 
      courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + courses.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) { next(err); }
});

// GET /api/courses/:id
router.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) { next(err); }
});

// Admin CRUD
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ course });
  } catch (err) { next(err); }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ course });
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;