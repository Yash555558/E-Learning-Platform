const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Course = require('../models/Course');
const { requireAuth } = require('../middleware/auth');

// POST /api/reviews - Submit a review
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { courseId, rating, comment } = req.body;
    const existingReview = await Review.findOne({ userId: req.user._id, courseId });
    if (existingReview) return res.status(400).json({ message: 'Review already submitted for this course' });
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    const review = await Review.create({
      userId: req.user._id,
      courseId,
      rating,
      comment
    });
    
    res.status(201).json({ review });
  } catch (err) { next(err); }
});

// GET /api/reviews/:courseId - Get reviews for a course
router.get('/:courseId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ courseId: req.params.courseId })
      .populate('userId', 'name')
      .sort('-createdAt');
    res.json({ reviews });
  } catch (err) { next(err); }
});

// PUT /api/reviews/:id - Update a review
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    
    review.rating = rating;
    review.comment = comment;
    await review.save();
    
    res.json({ review });
  } catch (err) { next(err); }
});

// DELETE /api/reviews/:id - Delete a review
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    
    await Review.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;