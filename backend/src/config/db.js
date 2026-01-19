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
  
  const options = {
    dbName: 'elearning',
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 30000,
    family: 4,
    maxPoolSize: 5,
    minPoolSize: 1
  };
  
  try {
    await mongoose.connect(uri, options);
    console.log('MongoDB connected successfully');
    return true;
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.log('Starting server without database connection...');
    return false;
  }
};