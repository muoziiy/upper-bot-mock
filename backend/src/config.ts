import dotenv from 'dotenv';

dotenv.config();

export const config = {
    botToken: process.env.BOT_TOKEN || '',
    miniAppUrl: process.env.MINI_APP_URL || 'https://your-frontend-url.onrender.com',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    port: process.env.PORT || 3000,
};
