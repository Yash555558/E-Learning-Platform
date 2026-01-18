const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  const url = new URL(process.env.CLOUDINARY_URL);
  cloudinary.config({
    cloud_name: url.hostname.split('.')[0],
    api_key: url.username,
    api_secret: url.password,
  });
  console.log('Cloudinary configured');
}

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  try {
    await mongoose.connect(uri, { dbName: 'elearning' });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Mongo connection error', err);
    process.exit(1);
  }
};