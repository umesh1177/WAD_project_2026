const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const uri =
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/clinicmanagementsystem';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`[MongoDB Atlas Connected]: Host=${conn.connection.host}, Database=${conn.connection.name}`);
  } catch (error) {
    console.warn(`[MongoDB Notice]: Could not connect to MongoDB Atlas (${error.message}).`);
    console.warn('[MongoDB Notice]: Please check network/IP whitelist in MongoDB Atlas dashboard.');
  }
};

module.exports = connectDB;

