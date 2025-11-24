"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const supabase_1 = require("./supabase");
const config_1 = require("./config");
const bot = new telegraf_1.Telegraf(config_1.config.botToken);
// Handle /start command
bot.start(async (ctx) => {
    const user = ctx.from;
    // Extract start payload (e.g., /start ref123 -> ref123)
    // ctx.message is not always present in all updates, but for 'start' command it usually is.
    // We can use ctx.payload if available (Telegraf 4.x doesn't have it by default on Context type without middleware, but we can parse text)
    const text = 'text' in ctx.message ? ctx.message.text : '';
    const startPayload = text.split(' ')[1] || '';
    if (!user) {
        return ctx.reply('Unable to identify user.');
    }
    try {
        // Check if user exists
        const { data: existingUser } = await supabase_1.supabase
            .from('users')
            .select('role')
            .eq('telegram_id', user.id)
            .single();
        let error;
        if (existingUser) {
            // Update existing user (preserve role)
            const { error: updateError } = await supabase_1.supabase
                .from('users')
                .update({
                username: user.username || null,
                first_name: user.first_name,
                last_name: user.last_name || null,
                updated_at: new Date().toISOString(),
            })
                .eq('telegram_id', user.id);
            error = updateError;
        }
        else {
            // Insert new user
            const { error: insertError } = await supabase_1.supabase
                .from('users')
                .insert({
                telegram_id: user.id,
                username: user.username || null,
                first_name: user.first_name,
                last_name: user.last_name || null,
                role: 'student', // Default role for new users
                updated_at: new Date().toISOString(),
            });
            error = insertError;
        }
        if (error) {
            console.error('Error upserting user:', error);
            return ctx.reply('Something went wrong. Please try again.');
        }
        // Construct Web App URL with start param if present
        let webAppUrl = config_1.config.miniAppUrl;
        if (startPayload) {
            const separator = webAppUrl.includes('?') ? '&' : '?';
            webAppUrl = `${webAppUrl}${separator}start_param=${startPayload}`;
        }
        // Send welcome message with Mini App button
        await ctx.reply(`Welcome, ${user.first_name}! 🎓\n\nClick the button below to open the Education Center app.`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '📚 Open Education Center',
                            web_app: { url: webAppUrl }
                        }
                    ]
                ]
            }
        });
    }
    catch (error) {
        console.error('Error in /start handler:', error);
        ctx.reply('An error occurred. Please try again later.');
    }
});
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
exports.default = bot;
