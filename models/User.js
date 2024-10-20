// Import mongoose to define the schema and interact with MongoDB
const mongoose = require('mongoose');

// Define a User schema for MongoDB
const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  points: { type: Number, default: 0 },
  lastCheckin: { type: Date, default: null },
  referredBy: { type: String, default: null },
  adsWatchedToday: { type: Number, default: 0 },    // NEW: Ads watched today
  lastAdWatched: { type: Date, default: null },     // NEW: Last ad watched date
});

// Create a User model from the schema
const User = mongoose.model('User', userSchema);

// Export the User model to be used in other files
module.exports = User;
