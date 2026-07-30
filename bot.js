// bot.js - Simple Node.js Telegram Bot Template using Telegraf
const { Telegraf, Markup } = require('telegraf');

// Insert your Bot Token from @BotFather here
const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN_HERE';
const bot = new Telegraf(BOT_TOKEN);

// URL of your web app deployed on GitHub Pages / Vercel
const WEB_APP_URL = 'https://your-github-username.github.io/mahabes-telegram-bot/';

// Command /start
bot.start((ctx) => {
    ctx.reply(
        'أهلاً بك في لعبة الماسة والمحيبس التفاعلية! 💎\n\nاضغط على الزر بالأسفل لفتح اللعبة والبدء باللعب مع أصدقائك:',
        Markup.inlineKeyboard([
            [Markup.button.webApp('لعب اللعبة الآن 🎮', WEB_APP_URL)]
        ])
    );
});

// Launch bot
bot.launch().then(() => {
    console.log('Bot is running successfully!');
}).catch((err) => {
    console.error('Error starting bot:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
