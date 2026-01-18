const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { requireAuth } = require('../middleware/auth');

// Create a simulated payment order for a course
router.post('/create-order', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.body;

    // Fetch course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Ensure price is in paise (for INR)
    const amount = Math.round(course.price * 100); // Convert to paise for INR
    
    if (amount <= 0) {
      return res.status(400).json({ message: 'Course is free or invalid price' });
    }

    // Return order details for simulation
    res.json({
      orderId: `sim_${Date.now()}_${courseId}`,
      amount: amount,
      currency: 'INR',
      courseId: courseId,
      courseTitle: course.title,
      simulated: true
    });
  } catch (err) {
    console.error('Error creating simulated order:', err);
    next(err);
  }
});

// Simulate payment and create enrollment
router.post('/simulate-payment', requireAuth, async (req, res) => {
  try {
    const { orderId, courseId } = req.body;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({ 
      userId: req.user._id, 
      courseId: courseId 
    });
    
    if (!existingEnrollment) {
      await Enrollment.create({
        userId: req.user._id,
        courseId: courseId,
        progress: new Map(),
        paymentStatus: 'completed',
        paymentId: orderId,
        paymentDate: new Date()
      });
    }

    res.json({ 
      success: true, 
      message: 'Payment simulated successfully and enrollment created!',
      orderId: orderId
    });
  } catch (error) {
    console.error('Error simulating payment:', error);
    res.status(500).json({ success: false, message: 'Error processing simulated payment' });
  }
});

module.exports = router;