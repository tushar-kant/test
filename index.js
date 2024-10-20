// Load environment variables from .env file
require('dotenv').config();

// Import the database connection
const connectDB = require('./db');

// Connect to MongoDB
connectDB();

// Import and initialize the bot
require('./bot');

// Create an Express app if you need the server to listen on a port
const express = require('express');
const app = express();

// Set up a simple route to check if the server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start the server and listen on a port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
