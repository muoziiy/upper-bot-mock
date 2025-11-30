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
                // Update status to overdue in DB
                await supabase_1.supabase
                    .from('group_members')
                    .update({ payment_status: 'overdue' })
                    .eq('group_id', group.id)
                    .eq('student_id', user.id);
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
// Process Scheduled Broadcasts (Run every minute)
router.get('/process-broadcasts', async (req, res) => {
    try {
        const now = new Date().toISOString();
        // 1. Fetch pending broadcasts due now or in past
        const { data: broadcasts, error } = await supabase_1.supabase
            .from('scheduled_broadcasts')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_at', now);
        if (error)
            throw error;
        let processed = 0;
        for (const broadcast of broadcasts || []) {
            try {
                // 2. Determine Recipients
                let query = supabase_1.supabase
                    .from('group_members')
                    .select('users(telegram_id)')
                    .not('users', 'is', null);
                // Check if group_ids is valid array and not empty
                const groupIds = broadcast.group_ids;
                if (Array.isArray(groupIds) && groupIds.length > 0 && !groupIds.includes('all')) {
                    query = query.in('group_id', groupIds);
                }
                const { data: members, error: memberError } = await query;
                if (memberError)
                    throw memberError;
                const telegramIds = [...new Set(members?.map((m) => m.users?.telegram_id).filter(Boolean))];
                // 3. Send Messages
                // We use axios here as in the rest of this file
                await Promise.allSettled(telegramIds.map(id => sendReminder(id, `📢 *Announcement*\n\n${broadcast.message}`)));
                // 4. Update Status
                await supabase_1.supabase
                    .from('scheduled_broadcasts')
                    .update({ status: 'sent' })
                    .eq('id', broadcast.id);
                processed++;
            }
            catch (e) {
                console.error(`Failed to process broadcast ${broadcast.id}`, e);
                await supabase_1.supabase
                    .from('scheduled_broadcasts')
                    .update({ status: 'failed' }) // Or keep pending to retry? Failed is safer to avoid loops.
                    .eq('id', broadcast.id);
            }
        }
        res.json({ success: true, processed });
    }
    catch (error) {
        console.error('Error processing broadcasts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
