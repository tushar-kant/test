// Load environment variables from .env file
require('dotenv').config();

// Import the database connection
const connectDB = require('./db');
const taskRoutes = require('./routes/taskRoutes'); // Adjust the path as necessary
const profileRoutes = require('./routes/profile'); // Adjust the path as necessary


// Connect to MongoDB
connectDB();
// Import and initialize the bot
require('./bot');

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



const Wishlist = require('./models/Wishlist'); // Import Wishlist model
// Import task routes

// Use task routes
app.use('/tasks', taskRoutes);
app.use('/profile', profileRoutes);



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
app.post('/check-wishlist', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Wishlist.findOne({ email });
    if (user) {
      return res.status(200).json({ message: 'Email found', points: user.points });
    } else {
      return res.status(404).json({ message: 'Email not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});
// API route to retrieve total points for a user
app.post('/get-total-points', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Wishlist.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user's total points
    return res.status(200).json({ points: user.points });
  } catch (error) {
    console.error('Error fetching user points:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user points
app.post('/update-points', async (req, res) => {
  const { email, points } = req.body;

  try {
    const user = await Wishlist.findOne({ email });
    if (user) {
      user.points += points;
      await user.save();
      return res.status(200).json({ message: 'Points updated', totalPoints: user.points });
    } else {
      return res.status(404).json({ message: 'Email not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
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
