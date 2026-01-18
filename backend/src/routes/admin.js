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

module.exports = router;