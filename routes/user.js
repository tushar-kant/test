const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user data by Telegram ID
router.get('/user/:telegramId', async (req, res) => {
  const { telegramId } = req.params;
  try {
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update points based on Telegram ID
router.post('/user/points', async (req, res) => {
  const { telegramId, points } = req.body;
  try {
    let user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.points += points;
    await user.save();
    res.json({ message: 'Points updated successfully', points: user.points });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
