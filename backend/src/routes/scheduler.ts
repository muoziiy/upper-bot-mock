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

// Process Scheduled Broadcasts (Run every minute)
router.get('/process-broadcasts', async (req, res) => {
    try {
        const now = new Date().toISOString();

        // 1. Fetch pending broadcasts due now or in past
        const { data: broadcasts, error } = await supabase
            .from('scheduled_broadcasts')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_at', now);

        if (error) throw error;

        let processed = 0;

        for (const broadcast of broadcasts || []) {
            try {
                // 2. Determine Recipients
                let query = supabase
                    .from('group_members')
                    .select('users(telegram_id)')
                    .not('users', 'is', null);

                // Check if group_ids is valid array and not empty
                const groupIds = broadcast.group_ids;
                if (Array.isArray(groupIds) && groupIds.length > 0 && !groupIds.includes('all')) {
                    query = query.in('group_id', groupIds);
                }

                const { data: members, error: memberError } = await query;
                if (memberError) throw memberError;

                const telegramIds = [...new Set(members?.map((m: any) => m.users?.telegram_id).filter(Boolean))];

                // 3. Send Messages
                // We use axios here as in the rest of this file
                await Promise.allSettled(telegramIds.map(id =>
                    sendReminder(id, `📢 *Announcement*\n\n${broadcast.message}`)
                ));

                // 4. Update Status
                await supabase
                    .from('scheduled_broadcasts')
                    .update({ status: 'sent' })
                    .eq('id', broadcast.id);

                processed++;

            } catch (e) {
                console.error(`Failed to process broadcast ${broadcast.id}`, e);
                await supabase
                    .from('scheduled_broadcasts')
                    .update({ status: 'failed' }) // Or keep pending to retry? Failed is safer to avoid loops.
                    .eq('id', broadcast.id);
            }
        }

        res.json({ success: true, processed });
    } catch (error) {
        console.error('Error processing broadcasts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
