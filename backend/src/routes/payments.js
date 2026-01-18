const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { requireAuth } = require('../middleware/auth');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a payment order for a course
router.post('/create-order', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.body;

    // Fetch course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Ensure price is in paise (Razorpay expects amount in smallest currency unit)
    const amount = Math.round(course.price * 100); // Convert to paise for INR
    
    if (amount <= 0) {
      return res.status(400).json({ message: 'Course is free or invalid price' });
    }

    // Create order with Razorpay
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `course_${courseId}_user_${req.user._id}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseId: courseId,
      courseTitle: course.title
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    next(err);
  }
});

// Verify payment and create enrollment
router.post('/verify-payment', requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    // Create the signature verification string
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Verify the signature
    if (expectedSignature === razorpay_signature) {
      // Signature matched, payment verified
      // Check if enrollment already exists
      const existingEnrollment = await Enrollment.findOne({ 
        userId: req.user._id, 
        courseId: courseId 
      });
      
      if (!existingEnrollment) {
        await Enrollment.create({
          userId: req.user._id,
          courseId: courseId,
          progress: new Map()
        });
      }

      res.json({ success: true, message: 'Payment verified and enrollment created successfully!' });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Error verifying payment' });
  }
});

module.exports = router;