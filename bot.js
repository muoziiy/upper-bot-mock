require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Replace with your token
const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;

if (!token) {
    console.error('Error: TELEGRAM_BOT_TOKEN is not defined in .env');
    process.exit(1);
}

if (!webAppUrl) {
    console.error('Error: WEB_APP_URL is not defined in .env');
    process.exit(1);
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        // Send a message with an inline keyboard
        bot.sendMessage(chatId, 'Welcome to UpperBot! 🎓\n\nClick the button below to open the app:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Open UpperBot',
                            web_app: { url: webAppUrl }
                        }
                    ]
                ]
            }
        });
    }
});

console.log('Bot is running...');
