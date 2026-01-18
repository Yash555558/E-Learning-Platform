const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: String,
  contentHtml: String,
  videoUrl: String,
  order: Number
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, default: 0 },
  category: String,
  difficulty: { type: String, enum: ['Beginner','Intermediate','Advanced'], default: 'Beginner' },
  thumbnailUrl: String,
  lessons: [lessonSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);