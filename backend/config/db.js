const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wad_clinic_management';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[MongoDB Notice]: Could not connect to local MongoDB (${error.message}).`);
    console.warn('[MongoDB Notice]: Ensure MongoDB is running on localhost:27017 for persistent DB storage.');
  }
};

module.exports = connectDB;
