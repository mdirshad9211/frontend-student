const mongoose = require('mongoose');

async function connectDB(mongoUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: process.env.NODE_ENV !== 'production',
  });
}

module.exports = { connectDB };

