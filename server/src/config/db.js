const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/love-date';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri);
    console.log('💞 Connected to MongoDB');
  } catch (error) {
    console.error('Mongo connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

