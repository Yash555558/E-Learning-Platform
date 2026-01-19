const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { requireAuth, requireAdmin } = require('../middleware/auth');

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
    // Calculate total revenue from completed payments
    const enrollmentsWithPayment = await Enrollment.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amountPaid' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalRevenue = enrollmentsWithPayment[0] ? enrollmentsWithPayment[0].totalRevenue : 0;
    
    // Get top courses by enrollment count
    const topCourses = await Enrollment.aggregate([
      { $match: { paymentStatus: 'completed' } },
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
    
    // Get monthly revenue
    const monthlyRevenue = await Enrollment.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: {
            month: { $month: "$paymentDate" },
            year: { $year: "$paymentDate" }
          },
          total: { $sum: '$amountPaid' },
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