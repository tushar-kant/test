// Load environment variables from .env file
require('dotenv').config();

// Import the database connection
const connectDB = require('./db');

// Connect to MongoDB
connectDB();

// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const cors = require('cors'); // Import cors


// Create an Express app
const app = express();
// Use CORS middleware (allow all origins by default)
app.use(cors());


// Middleware to parse JSON
app.use(express.json());

// Define the Wishlist model
const wishlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    unique: true, // Prevent duplicate emails
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// API route to add email to the wishlist
app.post('/wishlist', async (req, res) => {
  const { email } = req.body;

  // Validate the email
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    // Check if the email is already in the wishlist
    const existingEmail = await Wishlist.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists in the wishlist' });
    }

    // Save the email to the wishlist
    const newWishlistEntry = new Wishlist({ email });
    await newWishlistEntry.save();

    return res.status(201).json({ message: 'Email added to the wishlist successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Set up a simple route to check if the server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start the server and listen on a port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
