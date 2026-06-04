const mongoose = require('mongoose');
const { mongoUri } = require('../config');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  isConnected = true;
  return mongoose.connection;
}

module.exports = { connectDB };

