const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Temporary debug endpoint - REMOVE IN PRODUCTION
router.get('/debug-revenue', async (req, res, next) => {
  try {
    console.log('=== DEBUG REVENUE ENDPOINT CALLED ===');
    
    // Get all enrollments
    const allEnrollments = await Enrollment.find({}).lean();
    console.log('All enrollments:', allEnrollments);
    
    // Calculate revenue with our new inclusive approach
    const enrollmentsWithPayment = await Enrollment.aggregate([
      { 
        $match: { 
          $or: [
            { paymentStatus: 'completed' },
            { paymentStatus: { $exists: false } },
            { amountPaid: { $gt: 0 } }
          ]
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ['$amountPaid', 0] } },
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('Aggregation result:', enrollmentsWithPayment);
    
    const totalRevenue = enrollmentsWithPayment[0] ? enrollmentsWithPayment[0].totalRevenue : 0;
    
    res.json({
      totalRevenue,
      enrollmentCount: allEnrollments.length,
      sampleEnrollments: allEnrollments.slice(0, 3),
      aggregationResult: enrollmentsWithPayment
    });
  } catch (err) {
    console.error('Debug revenue error:', err);
    next(err);
  }
});

router.get('/users', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json({ users });
  } catch (err) { next(err); }
});

router.get('/reports', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    res.json({ 
      reports: { 
        totalUsers, 
        totalCourses, 
        totalEnrollments 
      } 
    });
  } catch (err) { next(err); }
});

// Enhanced analytics endpoint
router.get('/analytics', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // Calculate total revenue by joining enrollments with courses
    const revenueData = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $match: {
          $or: [
            { paymentStatus: 'completed' },
            { paymentStatus: { $exists: false } },
            { 'course.price': { $gt: 0 } } // Include paid courses regardless of payment status
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { 
            $sum: {
              $cond: [
                { $gt: ['$amountPaid', 0] }, // If amountPaid exists and > 0, use it
                '$amountPaid',
                '$course.price' // Otherwise use course price
              ]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalRevenue = revenueData[0] ? revenueData[0].totalRevenue : 0;
    
    // Debug logging
    console.log('Revenue calculation debug:');
    console.log('- Revenue data:', revenueData);
    console.log('- Total revenue calculated:', totalRevenue);
    
    // Also get all enrollments for comparison
    const allEnrollments = await Enrollment.find({});
    console.log('- Total enrollments in DB:', allEnrollments.length);
    console.log('- Sample enrollment data:', allEnrollments.slice(0, 2));
    
    // Get top courses by enrollment count
    const topCourses = await Enrollment.aggregate([
      { 
        $match: { 
          $or: [
            { paymentStatus: 'completed' },
            { paymentStatus: { $exists: false } },
            { amountPaid: { $gt: 0 } }
          ]
        } 
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$courseId',
          title: { $first: '$course.title' },
          enrollmentCount: { $sum: 1 }
        }
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 10 }
    ]);
    
    // Get user registration growth in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userGrowthData = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);
    
    // Get course category distribution
    const categoryDistribution = await Course.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get monthly revenue (updated to use our new revenue calculation)
    const monthlyRevenue = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $match: {
          $or: [
            { paymentStatus: 'completed' },
            { paymentStatus: { $exists: false } },
            { 'course.price': { $gt: 0 } }
          ]
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$enrolledAt" },
            year: { $year: "$enrolledAt" }
          },
          total: { 
            $sum: {
              $cond: [
                { $gt: ['$amountPaid', 0] },
                '$amountPaid',
                '$course.price'
              ]
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    res.json({ 
      analytics: { 
        totalRevenue,
        topCourses,
        userGrowthData,
        categoryDistribution,
        monthlyRevenue
      } 
    });
  } catch (err) { 
    console.error('Error fetching analytics:', err);
    next(err); 
  }
});

module.exports = router;