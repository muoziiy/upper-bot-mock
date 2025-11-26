"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../supabase");
const logger_1 = require("../logger");
const router = express_1.default.Router();
// Middleware to validate Telegram WebApp data
// This is a placeholder. Real implementation needs to verify the hash.
const validateTelegramData = (req, res, next) => {
    // TODO: Implement validation logic using bot token
    // For now, we assume the data is valid and passed in the body for testing
    next();
};
router.post('/login', validateTelegramData, async (req, res) => {
    const { id, first_name, last_name, username, language_code } = req.body;
    if (!id) {
        (0, logger_1.logError)(new Error('Missing Telegram ID in login request'), {
            ...(0, logger_1.getRequestInfo)(req),
            action: 'login'
        });
        return res.status(400).json({ error: 'Missing Telegram ID' });
    }
    try {
        // Upsert user
        const { data, error } = await supabase_1.supabase
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
        (0, logger_1.logInfo)('User login successful', {
            ...(0, logger_1.getRequestInfo)(req),
            action: 'login',
            userId: id
        });
        res.json({ message: 'Login successful', user: data });
    }
    catch (error) {
        (0, logger_1.logError)(error, {
            ...(0, logger_1.getRequestInfo)(req),
            action: 'login',
            userId: id
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
