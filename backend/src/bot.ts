import { Telegraf } from 'telegraf';
import { supabase } from './supabase';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN || '');

// Handle /start command
bot.start(async (ctx) => {
    const user = ctx.from;

    if (!user) {
        return ctx.reply('Unable to identify user.');
    }

    try {
        // Upsert user into Supabase
        const { data, error } = await supabase
            .from('users')
            .upsert({
                telegram_id: user.id,
                username: user.username || null,
                first_name: user.first_name,
                last_name: user.last_name || null,
                role: 'student', // Default role
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'telegram_id',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error upserting user:', error);
            return ctx.reply('Something went wrong. Please try again.');
        }

        // Send welcome message with Mini App button
        await ctx.reply(
            `Welcome, ${user.first_name}! 🎓\n\nClick the button below to open the Education Center app.`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '📚 Open Education Center',
                                web_app: { url: process.env.MINI_APP_URL || 'https://your-frontend-url.com' }
                            }
                        ]
                    ]
                }
            }
        );
    } catch (error) {
        console.error('Error in /start handler:', error);
        ctx.reply('An error occurred. Please try again later.');
    }
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
