const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { requireAuth } = require('../middleware/auth');

// Create a payment intent for a course
router.post('/create-payment-intent', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.body;

    // Fetch course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Ensure price is in cents (Stripe expects amount in smallest currency unit)
    const amount = Math.round(course.price * 100); // Convert to paisa for INR
    
    if (amount <= 0) {
      return res.status(400).json({ message: 'Course is free or invalid price' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'inr', // Using INR since we changed to ₹
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: req.user._id.toString(),
        courseId: courseId,
        courseTitle: course.title
      }
    });

    res.send({
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    next(err);
  }
});

// Webhook to handle payment confirmation
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Create enrollment after successful payment
    try {
      const { userId, courseId } = paymentIntent.metadata;
      
      // Check if enrollment already exists
      const existingEnrollment = await Enrollment.findOne({ 
        userId, 
        courseId 
      });
      
      if (!existingEnrollment) {
        await Enrollment.create({
          userId,
          courseId,
          progress: new Map()
        });
      }
    } catch (error) {
      console.error('Error creating enrollment after payment:', error);
    }
  }

  res.json({ received: true });
});

module.exports = router;