// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    default: 'No id',
  },
  firstName: {
    type: String,
    default: 'No first name',
  },
  lastName: {
    type: String,
    default: 'No last name',
  },
  username: {
    type: String,
    default: 'No username',
  },

  email: {
    type: String,
    default: null, // Set default to null or you can omit this line
  },
  points: {
    type: Number,
    default: 0,
  },
  lastCheckin: Date,
  adsWatchedToday: {
    type: Number,
    default: 0,
  },
  lastAdWatched: Date,
  referredBy: String, // ID of the referrer (if applicable)
});

module.exports = mongoose.model('User', userSchema);
