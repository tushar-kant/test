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

// Middleware for logging errors
function logError(error, context) {
  console.error(`Error in ${context}:`, error);
}

// Function to send the menu
function sendMenu(chatId) {
  bot.sendMessage(chatId, 'Welcome to Leaf! What would you like to do?', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Daily Check-In', callback_data: 'checkin' }],
        [{ text: 'Watch Ad (5/day)', callback_data: 'watchad' }],
        [{ text: 'Refer a Friend', callback_data: 'refer' }],
        [{ text: 'Tasks', callback_data: 'tasks' }],
        [{ text: 'Bind Your Wishlisted Email', callback_data: 'bind_email' }], // New menu option

        [
          { text: 'Visit Website', url: 'https://t.me/leafinnovator_bot/leaf' },
          { text: 'Visit Channel', url: 'https://t.me/+gusmEv1pYiVjMWNl' }
        ]
      ]
    }
  }).catch(err => logError(err, 'sendMenu'));
}
// Function to handle email binding
async function handleEmailBinding(chatId, email) {
  try {
    let user = await User.findOne({ telegramId: chatId }) || new User({ telegramId: chatId });

    // Update the user's email
    user.email = email; // Store the email
    await user.save();

    bot.sendMessage(chatId, `Your wishlisted email has been bound: ${email}`)
      .catch(err => logError(err, 'handleEmailBinding - success message'));
  } catch (err) {
    bot.sendMessage(chatId, 'An error occurred while binding your email.')
      .catch(err => logError(err, 'handleEmailBinding - message error'));
    logError(err, 'handleEmailBinding');
  }
}
// Function to validate the email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
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
  bot.sendMessage(chatId, tasks, { parse_mode: 'Markdown' })
    .catch(err => logError(err, 'sendTasks'));
}

// Function to handle daily check-in
async function handleCheckin(chatId) {
  try {
    let user = await User.findOne({ telegramId: chatId }) || new User({ telegramId: chatId });

    const now = new Date();
    const lastCheckin = user.lastCheckin ? new Date(user.lastCheckin) : null;

    if (lastCheckin && now - lastCheckin < 24 * 60 * 60 * 1000) {
      bot.sendMessage(chatId, 'You have already checked in today. Try again tomorrow.')
        .catch(err => logError(err, 'handleCheckin - already checked in'));
    } else {
      user.points = (user.points || 0) + 10; // Ensure points is initialized
      user.lastCheckin = now;
      await user.save();
      bot.sendMessage(chatId, `Check-in successful! You now have ${user.points} points.`)
        .catch(err => logError(err, 'handleCheckin - check-in successful'));
    }
  } catch (err) {
    bot.sendMessage(chatId, 'An error occurred during check-in.')
      .catch(err => logError(err, 'handleCheckin - message error'));
    logError(err, 'handleCheckin');
  }
}

// Function to handle watching ads and receiving points
async function handleAdWatch(chatId) {
  try {
    let user = await User.findOne({ telegramId: chatId }) || new User({ telegramId: chatId });

    const now = new Date();
    const lastAdWatched = user.lastAdWatched ? new Date(user.lastAdWatched) : null;

    // Reset ad count if it's a new day
    if (!lastAdWatched || now.getDate() !== lastAdWatched.getDate()) {
      user.adsWatchedToday = 0;
    }

    // Check if the user has reached the ad watch limit for today
    if (user.adsWatchedToday >= 5) {
      bot.sendMessage(chatId, 'You have reached the daily limit of 5 ads. Please come back tomorrow.')
        .catch(err => logError(err, 'handleAdWatch - limit reached'));
    } else {
      bot.sendMessage(chatId, '🌱 [Sponsored Ad] Support green initiatives! Visit GreenTech for sustainable energy solutions 🌱\nhttps://greentech.com')
        .catch(err => logError(err, 'handleAdWatch - ad message'));
      
      user.points = (user.points || 0) + 5; // Ensure points is initialized
      user.adsWatchedToday = (user.adsWatchedToday || 0) + 1; // Increment the ads watched today
      user.lastAdWatched = now; // Update last ad watched time
      await user.save();

      bot.sendMessage(chatId, `Thanks for watching the ad! You've earned 5 points. You now have ${user.points} points.`)
        .catch(err => logError(err, 'handleAdWatch - points message'));
    }
  } catch (err) {
    bot.sendMessage(chatId, 'An error occurred while rewarding points for watching an ad.')
      .catch(err => logError(err, 'handleAdWatch - message error'));
    logError(err, 'handleAdWatch');
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
        referrer.points = (referrer.points || 0) + 10; // Reward the referrer
        await referrer.save();
      }

      user.points = (user.points || 0) + 10; // Reward the new user
      await user.save();

      bot.sendMessage(chatId, 'You and your referrer have both been rewarded with 10 points!')
        .catch(err => logError(err, 'handleReferral - reward message'));
    } else {
      bot.sendMessage(chatId, 'You are already registered. You cannot be referred again.')
        .catch(err => logError(err, 'handleReferral - already registered'));
    }
  } catch (err) {
    bot.sendMessage(chatId, 'An error occurred while processing the referral.')
      .catch(err => logError(err, 'handleReferral - message error'));
    logError(err, 'handleReferral');
  }
}

// Function to generate a referral link
function generateReferralLink(chatId) {
  if (!botUsername) {
    bot.sendMessage(chatId, 'An error occurred while generating the referral link. Please try again later.')
      .catch(err => logError(err, 'generateReferralLink - message error'));
    return;
  }
  return `https://t.me/${botUsername}?start=${chatId}`;
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();

  if (text.startsWith('/start')) {
    sendMenu(chatId); // Call the sendMenu function
  } else if (text.startsWith('/points')) {
    await handlePoints(chatId); // Call the handlePoints function
  }
});

// Function to handle points command
async function handlePoints(chatId) {
  try {
    let user = await User.findOne({ telegramId: chatId });

    if (!user) {
      bot.sendMessage(chatId, 'You do not have an account yet. Please register first.')
        .catch(err => logError(err, 'handlePoints - not registered'));
      return;
    }

    // Send the user their total points
    bot.sendMessage(chatId, `You have a total of ${user.points || 0} points.`)
      .catch(err => logError(err, 'handlePoints - points message'));
  } catch (err) {
    bot.sendMessage(chatId, 'An error occurred while retrieving your points.')
      .catch(err => logError(err, 'handlePoints - message error'));
    logError(err, 'handlePoints');
  }
}

// Handle button clicks from the inline keyboard
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const action = callbackQuery.data;

  try {
    if (action === 'checkin') {
      await handleCheckin(chatId);
    } else if (action === 'watchad') {
      await handleAdWatch(chatId);
    } else if (action === 'refer') {
      // Generate referral link and send it to the user
      const referralLink = generateReferralLink(chatId);
      if (referralLink) {
        bot.sendMessage(chatId, `Share this referral link with friends: ${referralLink}`)
          .catch(err => logError(err, 'callback_query - referral link'));
      }
    } else if (action === 'tasks') {
      sendTasks(chatId); // Send tasks when the button is clicked
    }
    else if (action === 'bind_email') {
      bot.sendMessage(chatId, 'Please send me your wishlisted email:');
      bot.once('message', async (msg) => {
        const email = msg.text;

        if (validateEmail(email)) {
          await handleEmailBinding(chatId, email);
        } else {
          bot.sendMessage(chatId, 'Invalid email format. Please try again.');
        }
      });
    }
    if (action === 'start') {
      sendMenu(chatId);
    }
    bot.answerCallbackQuery(callbackQuery.id).catch(err => logError(err, 'callback_query - answer'));
  } catch (err) {
    logError(err, 'callback_query - action handling');
  }
});

// Export bot functions for external usage
module.exports = bot;
