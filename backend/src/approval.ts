import { Context, Telegraf, Markup } from 'telegraf';
import { supabase } from './supabase';
import { logError, logInfo, logWarning } from './logger';

// ==========================================
// 1. NOTIFY ADMINS (The "One Action" Setup)
// ==========================================

export const notifyAdminsOfNewRequest = async (
    bot: Telegraf,
    payload: {
        type: 'student' | 'staff',
        userId: number,
        name: string,
        details: string
    }
) => {
    try {
        logInfo('Starting admin notification process', {
            action: 'notify_admins_start',
            userId: payload.userId,
            additionalInfo: { type: payload.type }
        });

        // 1. Get User DB ID
        const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('telegram_id', payload.userId)
            .single();

        if (!userData) {
            logError(new Error('User not found for request creation'), {
                action: 'notify_admins_user_lookup',
                userId: payload.userId
            });
            return;
        }

        // 2. Create Registration Request
        const { data: request, error: reqError } = await supabase
            .from('registration_requests')
            .insert({
                user_id: userData.id,
                role_requested: payload.type === 'student' ? 'student' : 'teacher',
                status: 'pending'
            })
            .select()
            .single();

        if (reqError || !request) {
            logError(reqError || new Error('No request returned'), {
                action: 'create_registration_request',
                userId: payload.userId
            });
            return;
        }

        logInfo('Registration request created', {
            action: 'request_created',
            additionalInfo: { requestId: request.id }
        });

        // 3. Fetch All Admins
        const { data: admins, error } = await supabase
            .from('users')
            .select('telegram_id')
            .in('role', ['admin', 'super_admin']);

        if (error || !admins) {
            logError(error || new Error('No admins found'), { action: 'fetch_admins' });
            return;
        }

        logInfo(`Found ${admins.length} admins to notify`, {
            action: 'admins_fetched',
            additionalInfo: { count: admins.length }
        });

        // 4. Send Message to Each Admin & Log It
        const logs = [];
        const messageText = `🆕 **New ${payload.type === 'student' ? 'Student' : 'Staff'} Request**\n\n${payload.details}`;

        for (const admin of admins) {
            if (!admin.telegram_id) continue;

            try {
                const sentMsg = await bot.telegram.sendMessage(Number(admin.telegram_id), messageText, {
                    parse_mode: 'Markdown',
                    ...Markup.inlineKeyboard([
                        [
                            Markup.button.callback('✅ Approve', `approve_req:${request.id}`),
                            Markup.button.callback('❌ Decline', `decline_req:${request.id}`)
                        ]
                    ])
                });

                logs.push({
                    request_id: request.id,
                    admin_chat_id: sentMsg.chat.id,
                    message_id: sentMsg.message_id
                });

            } catch (e) {
                logError(e, {
                    action: 'send_admin_message',
                    additionalInfo: { adminId: admin.telegram_id }
                });
            }
        }

        // 5. Save Logs (The "Sync" Table)
        if (logs.length > 0) {
            const { error: logErrorDb } = await supabase
                .from('admin_notification_logs')
                .insert(logs);

            if (logErrorDb) {
                logError(logErrorDb, { action: 'save_notification_logs' });
            } else {
                logInfo('Notification logs saved', {
                    action: 'logs_saved',
                    additionalInfo: { count: logs.length }
                });
            }
        }

    } catch (e) {
        logError(e, { action: 'notifyAdminsOfNewRequest_fatal' });
    }
};

// ==========================================
// 2. HANDLE APPROVAL (The "Mass Update")
// ==========================================

export const setupApprovalHandlers = (bot: Telegraf) => {

    bot.action(/^(approve|decline)_req:(.+)$/, async (ctx) => {
        const action = ctx.match[1]; // 'approve' or 'decline'
        const requestId = ctx.match[2];
        const adminTelegramId = ctx.from?.id;
        const adminName = ctx.from?.first_name || 'Admin';

        if (!adminTelegramId) return;

        logInfo(`Admin action received: ${action}`, {
            action: 'admin_action_received',
            userId: adminTelegramId,
            additionalInfo: { requestId, action, rawMatch: ctx.match }
        });

        try {
            // 1. Verify Admin Authority
            const { data: adminUser } = await supabase
                .from('users')
                .select('id, role, first_name') // Get ID too for logging
                .eq('telegram_id', adminTelegramId)
                .single();

            if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
                logWarning('Unauthorized approval attempt', {
                    action: 'unauthorized_approval',
                    userId: adminTelegramId
                });
                return ctx.answerCbQuery('⛔ You are not authorized.');
            }

            // 2. ATOMIC CHECK (The Safety Lock)
            logInfo('Fetching request from DB', { additionalInfo: { requestId } });

            const { data: request, error: fetchError } = await supabase
                .from('registration_requests')
                .select('*, users:users!registration_requests_user_id_fkey(telegram_id, first_name)')
                .eq('id', requestId)
                .single();

            if (fetchError) {
                logError(fetchError, { action: 'fetch_request_error', additionalInfo: { requestId } });
            }

            if (!request) {
                logWarning('Approval request not found', { additionalInfo: { requestId, fetchError } });
                return ctx.answerCbQuery('⚠️ Request not found.');
            }

            if (request.status !== 'pending') {
                logInfo('Request already processed', {
                    action: 'request_already_processed',
                    additionalInfo: { status: request.status }
                });
                return ctx.answerCbQuery(`⚠️ Request already ${request.status}.`);
            }

            // 3. PROCESS THE ACTION
            const newStatus = action === 'approve' ? 'approved' : 'declined';

            // Update Request
            const { error: updateError } = await supabase
                .from('registration_requests')
                .update({
                    status: newStatus,
                    processed_by: adminUser.id,
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId);

            if (updateError) throw updateError;

            logInfo(`Request status updated to ${newStatus}`, { additionalInfo: { requestId } });

            // Update User Role (if approved) or Revert (if declined)
            if (action === 'approve') {
                const newRole = request.role_requested === 'student' ? 'student' : 'teacher';
                await supabase.from('users').update({ role: newRole }).eq('id', request.user_id);

                // Notify User
                if (request.users?.telegram_id) {
                    await bot.telegram.sendMessage(
                        Number(request.users.telegram_id),
                        '🎉 **Congratulations!**\n\nYour account has been approved. You can now access the app.',
                        { parse_mode: 'Markdown' }
                    );
                }
            } else {
                // If declined, ensure they stay as 'new_user' or 'guest' (or whatever logic you prefer)
                await supabase.from('users').update({ role: 'new_user' }).eq('id', request.user_id);

                // Notify User
                if (request.users?.telegram_id) {
                    await bot.telegram.sendMessage(
                        Number(request.users.telegram_id),
                        '❌ Your registration request was declined.',
                        { parse_mode: 'Markdown' }
                    );
                }
            }

            // 4. MASS UPDATE (The "Sync" Magic)
            const { data: logs } = await supabase
                .from('admin_notification_logs')
                .select('admin_chat_id, message_id')
                .eq('request_id', requestId);

            if (logs) {
                logInfo(`Starting mass update for ${logs.length} messages`, { additionalInfo: { requestId } });

                const updatePromises = logs.map(async (log) => {
                    const isAdminWhoClicked = log.admin_chat_id.toString() === adminTelegramId.toString();

                    let newText = '';
                    if (action === 'approve') {
                        newText = isAdminWhoClicked
                            ? `✅ **You approved this request.**`
                            : `✅ **Approved by ${adminName}**`;
                    } else {
                        newText = isAdminWhoClicked
                            ? `❌ **You declined this request.**`
                            : `❌ **Declined by ${adminName}**`;
                    }

                    const studentName = request.users?.first_name || 'User';
                    const finalMessage = `${newText}\n\n👤 ${studentName} (${request.role_requested})`;

                    try {
                        await bot.telegram.editMessageText(
                            log.admin_chat_id,
                            Number(log.message_id),
                            undefined,
                            finalMessage,
                            { parse_mode: 'Markdown', reply_markup: undefined } // Remove buttons
                        );
                    } catch (e) {
                        // Message might be deleted or too old
                        // console.warn('Failed to edit admin message', e);
                    }
                });

                await Promise.all(updatePromises);
                logInfo('Mass update completed', { additionalInfo: { requestId } });
            }

            // Answer the interaction for the clicker
            await ctx.answerCbQuery(`Done!`);

        } catch (error) {
            logError(error, { action: 'handle_approval_action', additionalInfo: { requestId } });
            ctx.answerCbQuery('An error occurred.');
        }
    });
};
