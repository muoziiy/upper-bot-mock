"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../supabase");
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
        res.json({ message: 'Login successful', user: data });
    }
    catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
