const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { requireAuth } = require('../middleware/auth');
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('Stripe secret key not configured. Payment processing will be disabled.');
  stripe = null;
}

// Create a simulated payment order for a course
router.post('/create-order', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.body;

    // Fetch course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Ensure price is valid
    if (course.price <= 0) {
      return res.status(400).json({ message: 'Course is free or invalid price' });
    }

    // Return order details for simulation
    res.json({
      orderId: `sim_${Date.now()}_${courseId}`,
      amount: course.price,
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

// Create a real payment intent for Stripe
router.post('/create-payment-intent', requireAuth, async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Payment processing is not configured. Please contact the administrator.'
      });
    }

    const { courseId, amount, currency } = req.body;

    // Fetch course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate amount matches course price
    if (amount !== course.price * 100) { // Convert to smallest currency unit
      return res.status(400).json({ message: 'Amount mismatch with course price' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency || 'usd',
      metadata: {
        userId: req.user._id.toString(),
        courseId: courseId,
        courseTitle: course.title
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Simulate payment and create enrollment
router.post('/simulate-payment', requireAuth, async (req, res) => {
  try {
    const { orderId, courseId } = req.body;

    // Simulate payment processing delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));

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
        paymentDate: new Date(),
        amountPaid: (await Course.findById(courseId)).price
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