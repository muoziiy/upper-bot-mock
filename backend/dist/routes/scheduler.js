"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../supabase");
const date_fns_1 = require("date-fns");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
// Helper to send simple message
async function sendReminder(telegramId, message) {
    try {
        await axios_1.default.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
    }
    catch (e) {
        console.error(`Failed to send reminder to ${telegramId}`, e);
    }
}
// CRON Endpoint - Should be called daily at 08:00
router.get('/daily', async (req, res) => {
    try {
        const today = (0, date_fns_1.startOfDay)(new Date());
        const threeDaysFromNow = (0, date_fns_1.addDays)(today, 3);
        // Fetch all active group members with Type A/B (Monthly)
        // We need to join with groups to check payment_type
        const { data: members, error } = await supabase_1.supabase
            .from('group_members')
            .select(`
                *,
                groups (
                    id,
                    name,
                    payment_type,
                    price
                ),
                users (
                    id,
                    first_name,
                    telegram_id
                )
            `)
            .not('next_due_date', 'is', null);
        if (error)
            throw error;
        let processed = 0;
        for (const member of members || []) {
            const group = member.groups;
            const user = member.users;
            if (!group || !user || !user.telegram_id)
                continue;
            if (group.payment_type === 'lesson_based')
                continue; // Skip lesson based
            const dueDate = (0, date_fns_1.startOfDay)(new Date(member.next_due_date));
            // 1. 3 Days Before
            if ((0, date_fns_1.isSameDay)(dueDate, threeDaysFromNow)) {
                await sendReminder(user.telegram_id, `📅 *Payment Reminder*\n\nYour payment for *${group.name}* is due in 3 days (${member.next_due_date}).\nAmount: $${group.price}`);
                processed++;
            }
            // 2. Due Date
            else if ((0, date_fns_1.isSameDay)(dueDate, today)) {
                await sendReminder(user.telegram_id, `❗ *Payment Due Today*\n\nYour payment for *${group.name}* is due today.\nPlease make a payment to avoid overdue status.`);
                processed++;
            }
            // 3. Overdue (Day 1-10)
            else if ((0, date_fns_1.isBefore)(dueDate, today)) {
                const daysOverdue = (0, date_fns_1.differenceInDays)(today, dueDate);
                if (daysOverdue <= 10) {
                    await sendReminder(user.telegram_id, `⚠️ *Overdue Payment*\n\nYour payment for *${group.name}* was due on ${member.next_due_date}.\nYou are ${daysOverdue} days late. Please pay as soon as possible.`);
                    processed++;
                }
            }
        }
        res.json({ success: true, processed });
    }
    catch (error) {
        console.error('Error in daily scheduler:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
