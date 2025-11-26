import express from 'express';
import { supabase } from '../supabase';
import { logError, logInfo, getRequestInfo } from '../logger';

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
        logError(new Error('Missing Telegram ID in login request'), {
            ...getRequestInfo(req),
            action: 'login'
        });
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

        logInfo('User login successful', {
            ...getRequestInfo(req),
            action: 'login',
            userId: id
        });

        res.json({ message: 'Login successful', user: data });
    } catch (error) {
        logError(error, {
            ...getRequestInfo(req),
            action: 'login',
            userId: id
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
