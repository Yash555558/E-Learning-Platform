const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Map, of: Boolean, default: {} },
  enrolledAt: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentId: { type: String },
  paymentDate: { type: Date },
  amountPaid: { type: Number, default: 0 }
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);