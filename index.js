// Load environment variables from .env file
require('dotenv').config();

// Import the database connection
const connectDB = require('./db');

// Connect to MongoDB
connectDB();

// Import and initialize the bot
require('./bot');
