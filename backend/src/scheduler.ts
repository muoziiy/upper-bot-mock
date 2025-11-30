import cron from 'node-cron';
import { supabase } from './supabase';
import bot from './bot';
import { checkStudentStatus } from './utils/paymentLogic';

export const startScheduler = () => {
    // Run every day at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
        console.log('Running daily payment check...');

        try {
            // 1. Fetch all students with their active groups
            const { data: students, error } = await supabase
                .from('users')
                .select(`
                    id,
                    telegram_id,
                    first_name,
                    group_members (
                        group_id,
                        joined_at,
                        anchor_day,
                        lessons_remaining,
                        next_due_date,
                        last_payment_date,
                        payment_type,
                        groups (
                            id,
                            name,
                            price,
                            payment_type
                        )
                    )
                `)
                .eq('role', 'student');

            if (error) throw error;

            if (!students) return;

            // 2. Check each student
            for (const student of students) {
                if (!student.telegram_id) continue;

                const overdueGroups = [];

                for (const gm of student.group_members as any[]) {
                    const group = gm.groups;
                    if (!group) continue;

                    const status = checkStudentStatus({
                        joined_at: gm.joined_at,
                        anchor_day: gm.anchor_day,
                        lessons_remaining: gm.lessons_remaining,
                        next_due_date: gm.next_due_date,
                        last_payment_date: gm.last_payment_date
                    }, {
                        payment_type: group.payment_type,
                        price: group.price
                    }, gm.payment_type);

                    if (status === 'overdue') {
                        overdueGroups.push(group.name);
                    }
                }

                // 3. Send Notification if Overdue
                if (overdueGroups.length > 0) {
                    const message = `⚠️ **Payment Reminder**\n\nDear ${student.first_name}, your payment is overdue for the following groups:\n\n${overdueGroups.map(g => `• ${g}`).join('\n')}\n\nPlease make a payment to avoid interruption.`;

                    try {
                        await bot.telegram.sendMessage(Number(student.telegram_id), message, { parse_mode: 'Markdown' });
                        console.log(`Sent overdue notification to ${student.first_name} (${student.id})`);
                    } catch (e) {
                        console.error(`Failed to send notification to ${student.id}`, e);
                    }
                }
            }

            console.log('Daily payment check completed.');

        } catch (e) {
            console.error('Error in daily scheduler:', e);
        }
    });
};
