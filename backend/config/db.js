const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[MongoDB Error]: MONGO_URI environment variable is not set.');
    console.error('[MongoDB Error]: Please set MONGO_URI in your .env file or deployment environment.');
    return;
  }

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

