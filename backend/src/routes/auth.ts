import express from 'express';
import { supabase } from '../supabase';

const router = express.Router();

// Middleware to validate Telegram WebApp data
// This is a placeholder. Real implementation needs to verify the hash.
const validateTelegramData = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // TODO: Implement validation logic using bot token
    // For now, we assume the data is valid and passed in the body for testing
    next();
};

router.post('/login', validateTelegramData, async (req, res) => {
    const { id, first_name, last_name, username, language_code } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Missing Telegram ID' });
    }

    try {
        // Upsert user
        const { data, error } = await supabase
            .from('users')
            .upsert({
                telegram_id: id,
                first_name,
                last_name,
                username,
                language_code,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'telegram_id' })
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json({ message: 'Login successful', user: data });
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
