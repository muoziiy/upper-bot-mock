import { Router } from 'express';
import { supabase } from '../supabase';
import { addDays, startOfDay, isSameDay, isBefore, differenceInDays } from 'date-fns';
import { sendStudentPaymentNotification } from '../services/notifications'; // We might need a generic notification or reuse this
import axios from 'axios';

const router = Router();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Helper to send simple message
async function sendReminder(telegramId: number, message: string) {
    try {
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (e) {
        console.error(`Failed to send reminder to ${telegramId}`, e);
    }
}

// CRON Endpoint - Should be called daily at 08:00
router.get('/daily', async (req, res) => {
    try {
        const today = startOfDay(new Date());
        const threeDaysFromNow = addDays(today, 3);

        // Fetch all active group members with Type A/B (Monthly)
        // We need to join with groups to check payment_type
        const { data: members, error } = await supabase
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

        if (error) throw error;

        let processed = 0;

        for (const member of members || []) {
            const group = member.groups;
            const user = member.users;

            if (!group || !user || !user.telegram_id) continue;
            if (group.payment_type === 'lesson_based') continue; // Skip lesson based

            const dueDate = startOfDay(new Date(member.next_due_date));

            // 1. 3 Days Before
            if (isSameDay(dueDate, threeDaysFromNow)) {
                await sendReminder(
                    user.telegram_id,
                    `📅 *Payment Reminder*\n\nYour payment for *${group.name}* is due in 3 days (${member.next_due_date}).\nAmount: $${group.price}`
                );
                processed++;
            }

            // 2. Due Date
            else if (isSameDay(dueDate, today)) {
                await sendReminder(
                    user.telegram_id,
                    `❗ *Payment Due Today*\n\nYour payment for *${group.name}* is due today.\nPlease make a payment to avoid overdue status.`
                );
                processed++;
            }

            // 3. Overdue (Day 1-10)
            else if (isBefore(dueDate, today)) {
                const daysOverdue = differenceInDays(today, dueDate);

                // Update status to overdue in DB
                await supabase
                    .from('group_members')
                    .update({ payment_status: 'overdue' })
                    .eq('group_id', group.id)
                    .eq('student_id', user.id);

                if (daysOverdue <= 10) {
                    await sendReminder(
                        user.telegram_id,
                        `⚠️ *Overdue Payment*\n\nYour payment for *${group.name}* was due on ${member.next_due_date}.\nYou are ${daysOverdue} days late. Please pay as soon as possible.`
                    );
                    processed++;
                }
            }
        }

        res.json({ success: true, processed });

    } catch (error) {
        console.error('Error in daily scheduler:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
