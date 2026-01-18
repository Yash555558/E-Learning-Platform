const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { requireAuth } = require('../middleware/auth');

// POST /api/enrollments
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const existing = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (existing) return res.status(400).json({ message: 'Already enrolled' });
    const enroll = await Enrollment.create({ userId: req.user._id, courseId });
    res.status(201).json({ enrollment: enroll });
  } catch (err) { next(err); }
});

// GET /api/enrollments/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id }).populate('courseId');
    res.json({ enrollments });
  } catch (err) { next(err); }
});

// PUT /api/enrollments/:id/progress
router.put('/:id/progress', requireAuth, async (req, res, next) => {
  try {
    const { lessonId, done } = req.body;
    const enroll = await Enrollment.findById(req.params.id);
    if (!enroll) return res.status(404).json({ message: 'Enrollment not found' });
    if (enroll.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    enroll.progress.set(lessonId, !!done);
    await enroll.save();
    res.json({ enrollment: enroll });
  } catch (err) { next(err); }
});

module.exports = router;