// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const User = require('./models/User'); // Assuming you have a separate file for the User model

// Initialize the bot with the token from environment variables
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Variable to store the bot username
let botUsername;

// Fetch bot details, including the username
bot.getMe().then((botInfo) => {
  botUsername = botInfo.username;
  console.log(`Bot username is @${botUsername}`);
}).catch((err) => {
  console.error('Failed to retrieve bot username:', err);
});

// Function to send the menu
function sendMenu(chatId) {
  bot.sendMessage(chatId, 'Welcome to Leaf! What would you like to do?', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Daily Check-In', callback_data: 'checkin' }],
        [{ text: 'Watch Ad (5/day)', callback_data: 'watchad' }],
        [{ text: 'Refer a Friend', callback_data: 'refer' }],
        [{ text: 'Tasks', callback_data: 'tasks' }] // New Tasks button
      ]
    }
  });
}

// Function to send tasks to the user
function sendTasks(chatId) {
  const tasks = `
Here are some tasks you can complete to earn points:

1. **Join our YouTube channel**: [YouTube Channel Link](https://www.youtube.com/your-channel)
2. **Follow us on Twitter**: [Twitter Profile](https://twitter.com/your-profile)
3. **Join our Discord server**: [Discord Server](https://discord.gg/your-invite)

Complete these tasks and let us know to earn additional points!
  `;
  bot.sendMessage(chatId, tasks, { parse_mode: 'Markdown' });
}

// Function to handle daily check-in
async function handleCheckin(chatId) {
  try {
    let user = await User.findOne({ telegramId: chatId });
    
    if (!user) {
      user = new User({ telegramId: chatId });
    }

    const now = new Date();
    const lastCheckin = user.lastCheckin ? new Date(user.lastCheckin) : null;

    if (lastCheckin && now - lastCheckin < 24 * 60 * 60 * 1000) {
      bot.sendMessage(chatId, 'You have already checked in today. Try again tomorrow.');
    } else {
      user.points += 10; // Reward 10 points for daily check-in
      user.lastCheckin = now;
      await user.save();
      bot.sendMessage(chatId, `Check-in successful! You now have ${user.points} points.`);
    }
  } catch (err) {
    bot.sendMessage(chatId, 'An error occurred during check-in.');
    console.error(err);
  }
}

// Function to handle watching ads and receiving points
async function handleAdWatch(chatId) {
  try {
    let user = await User.findOne({ telegramId: chatId });
    
    if (!user) {
      user = new User({ telegramId: chatId });
    }

    const now = new Date();
    const lastAdWatched = user.lastAdWatched ? new Date(user.lastAdWatched) : null;

    // Reset ad count if it's a new day
    if (!lastAdWatched || now.getDate() !== lastAdWatched.getDate()) {
      user.adsWatchedToday = 0;
    }

    // Check if the user has reached the ad watch limit for today
    if (user.adsWatchedToday >= 5) {
      bot.sendMessage(chatId, 'You have reached the daily limit of 5 ads. Please come back tomorrow.');
    } else {
      // Simulate ad viewing by sending an ad text
      bot.sendMessage(chatId, '🌱 [Sponsored Ad] Support green initiatives! Visit GreenTech for sustainable energy solutions 🌱\nhttps://greentech.com');

      user.points += 5; // Reward 5 points for watching an ad
      user.adsWatchedToday += 1; // Increment the ads watched today
      user.lastAdWatched = now;  // Update last ad watched time
      await user.save();
      
      bot.sendMessage(chatId, `Thanks for watching the ad! You've earned 5 points. You now have ${user.points} points.`);
    }
  } catch (err) {
    bot.sendMessage(chatId, 'An error occurred while rewarding points for watching an ad.');
    console.error(err);
  }
}

// Function to handle user referrals
async function handleReferral(chatId, referrerId) {
  try {
    let user = await User.findOne({ telegramId: chatId });
    if (!user) {
      user = new User({ telegramId: chatId, referredBy: referrerId });
      await user.save();
      
      // Reward both the referrer and the new user
      let referrer = await User.findOne({ telegramId: referrerId });
      if (referrer) {
        referrer.points += 10; // Reward the referrer
        await referrer.save();
      }

      user.points += 10; // Reward the new user
      await user.save();
      
      bot.sendMessage(chatId, 'You and your referrer have both been rewarded with 10 points!');
    } else {
      bot.sendMessage(chatId, 'You are already registered. You cannot be referred again.');
    }
  } catch (err) {
    bot.sendMessage(chatId, 'An error occurred while processing the referral.');
    console.error(err);
  }
}

// Function to generate a referral link
function generateReferralLink(chatId) {
  if (!botUsername) {
    bot.sendMessage(chatId, 'An error occurred while generating the referral link. Please try again later.');
    return;
  }
  return `https://t.me/${botUsername}?start=${chatId}`;
}

// Handle incoming bot messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();

  if (text.startsWith('/start')) {
    sendMenu(chatId); // Call the sendMenu function
  }
});

// Handle button clicks from the inline keyboard
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const action = callbackQuery.data;

  if (action === 'checkin') {
    await handleCheckin(chatId);
  } else if (action === 'watchad') {
    await handleAdWatch(chatId);
  } else if (action === 'refer') {
    // Generate referral link and send it to the user
    const referralLink = generateReferralLink(chatId);
    if (referralLink) {
      bot.sendMessage(chatId, `Share this referral link with friends: ${referralLink}`);
    }
  } else if (action === 'tasks') {
    sendTasks(chatId); // Send tasks when the button is clicked
  }

  bot.answerCallbackQuery(callbackQuery.id);
  sendMenu(chatId); // Always show the menu after any action
});

// Export bot functions for external usage
module.exports = bot;
