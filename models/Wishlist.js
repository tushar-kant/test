// models/Wishlist.js

const mongoose = require('mongoose');
const validator = require('validator');

const wishlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    unique: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  completedTasks: {
    type: [String], // Array to store completed task IDs
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
