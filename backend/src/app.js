require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const enrollRoutes = require('./routes/enrollments');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');
const uploadRoutes = require('./routes/uploads');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to database
connectDB().catch(err => {
  console.error('Database connection error:', err);
  // Continue running the app but with degraded functionality
});

app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://e-learning-platform-p6w87tcbp-yash-kumars-projects-27a72d6d.vercel.app',
      'https://e-learning-platform-ten-rosy.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean), // filter out any null/undefined values
    credentials: true
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

module.exports = app;