const express = require('express');
const User = require('../models/User'); // Import the User model
const Wishlist = require('../models/Wishlist'); // Adjust the path as necessary
const router = express.Router();

router.post('/', async (req, res) => {
  const { email } = req.body;

  try {
    // Fetch user profile based on the provided email
    const userProfile = await User.findOne({ email });
    const wishlistProfile = await Wishlist.findOne({ email });

    if (!userProfile && !wishlistProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Combine user profile with wishlist profile
    const combinedProfile = {
      telegramId: userProfile ? userProfile.telegramId : null,
      userId: userProfile ? userProfile.userId : null,
     
      email: wishlistProfile ? wishlistProfile.email : null,
      wishlistPoints: wishlistProfile ? wishlistProfile.points : null,
      userPoints: userProfile ? userProfile.points : null,
      referredBy: userProfile ? userProfile.referredBy : null,
      joinDate: wishlistProfile ? wishlistProfile.createdAt : null,



    };

    res.status(200).json(combinedProfile);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while fetching profile data' });
  }
});

module.exports = router;
