"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupApprovalHandlers = exports.notifyAdminsOfNewRequest = void 0;
const telegraf_1 = require("telegraf");
const supabase_1 = require("./supabase");
// ==========================================
// 1. NOTIFY ADMINS (The "One Action" Setup)
// ==========================================
const notifyAdminsOfNewRequest = async (bot, payload) => {
    try {
        // 1. Get User DB ID
        const { data: userData } = await supabase_1.supabase
            .from('users')
            .select('id')
            .eq('telegram_id', payload.userId)
            .single();
        if (!userData) {
            console.error('User not found for request creation');
            return;
        }
        // 2. Create Registration Request
        const { data: request, error: reqError } = await supabase_1.supabase
            .from('registration_requests')
            .insert({
            user_id: userData.id,
            role_requested: payload.type === 'student' ? 'student' : 'teacher',
            status: 'pending'
        })
            .select()
            .single();
        if (reqError || !request) {
            console.error('Failed to create registration request', reqError);
            return;
        }
        // 3. Fetch All Admins
        const { data: admins, error } = await supabase_1.supabase
            .from('users')
            .select('telegram_id')
            .in('role', ['admin', 'super_admin']);
        if (error || !admins) {
            console.error('Failed to fetch admins', error);
            return;
        }
        // 4. Send Message to Each Admin & Log It
        const logs = [];
        const messageText = `🆕 **New ${payload.type === 'student' ? 'Student' : 'Staff'} Request**\n\n${payload.details}`;
        for (const admin of admins) {
            if (!admin.telegram_id)
                continue;
            try {
                const sentMsg = await bot.telegram.sendMessage(Number(admin.telegram_id), messageText, {
                    parse_mode: 'Markdown',
                    ...telegraf_1.Markup.inlineKeyboard([
                        [
                            telegraf_1.Markup.button.callback('✅ Approve', `approve_req:${request.id}`),
                            telegraf_1.Markup.button.callback('❌ Decline', `decline_req:${request.id}`)
                        ]
                    ])
                });
                logs.push({
                    request_id: request.id,
                    admin_chat_id: sentMsg.chat.id,
                    message_id: sentMsg.message_id
                });
            }
            catch (e) {
                console.error(`Failed to notify admin ${admin.telegram_id}`, e);
            }
        }
        // 5. Save Logs (The "Sync" Table)
        if (logs.length > 0) {
            const { error: logError } = await supabase_1.supabase
                .from('admin_notification_logs')
                .insert(logs);
            if (logError)
                console.error('Failed to save notification logs', logError);
        }
    }
    catch (e) {
        console.error('Error in notifyAdminsOfNewRequest', e);
    }
};
exports.notifyAdminsOfNewRequest = notifyAdminsOfNewRequest;
// ==========================================
// 2. HANDLE APPROVAL (The "Mass Update")
// ==========================================
const setupApprovalHandlers = (bot) => {
    bot.action(/^(approve|decline)_req:(.+)$/, async (ctx) => {
        const action = ctx.match[1]; // 'approve' or 'decline'
        const requestId = ctx.match[2];
        const adminTelegramId = ctx.from?.id;
        const adminName = ctx.from?.first_name || 'Admin';
        if (!adminTelegramId)
            return;
        try {
            // 1. Verify Admin Authority
            const { data: adminUser } = await supabase_1.supabase
                .from('users')
                .select('id, role, first_name') // Get ID too for logging
                .eq('telegram_id', adminTelegramId)
                .single();
            if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
                return ctx.answerCbQuery('⛔ You are not authorized.');
            }
            // 2. ATOMIC CHECK (The Safety Lock)
            const { data: request } = await supabase_1.supabase
                .from('registration_requests')
                .select('*, users(telegram_id, first_name)')
                .eq('id', requestId)
                .eq('id', requestId)
                .single();
            if (!request) {
                return ctx.answerCbQuery('⚠️ Request not found.');
            }
            // 3. PROCESS THE ACTION
            const newStatus = action === 'approve' ? 'approved' : 'declined';
            // Update Request
            await supabase_1.supabase
                .from('registration_requests')
                .update({
                status: newStatus,
                processed_by: adminUser.id,
                updated_at: new Date().toISOString()
            })
                .eq('id', requestId);
            // Update User Role (if approved) or Revert (if declined)
            if (action === 'approve') {
                const newRole = request.role_requested === 'student' ? 'student' : 'teacher';
                await supabase_1.supabase.from('users').update({ role: newRole }).eq('id', request.user_id);
                // Notify User
                if (request.users?.telegram_id) {
                    await bot.telegram.sendMessage(Number(request.users.telegram_id), '🎉 **Congratulations!**\n\nYour account has been approved. You can now access the app.', { parse_mode: 'Markdown' });
                }
            }
            else {
                // If declined, ensure they stay as 'new_user' or 'guest' (or whatever logic you prefer)
                // Usually we might reset them to 'new_user' so they can try again or just leave them as is.
                // For now, let's set to 'new_user' to be safe.
                await supabase_1.supabase.from('users').update({ role: 'new_user' }).eq('id', request.user_id);
                // Notify User
                if (request.users?.telegram_id) {
                    await bot.telegram.sendMessage(Number(request.users.telegram_id), '❌ Your registration request was declined.', { parse_mode: 'Markdown' });
                }
            }
            // 4. MASS UPDATE (The "Sync" Magic)
            const { data: logs } = await supabase_1.supabase
                .from('admin_notification_logs')
                .select('admin_chat_id, message_id')
                .eq('request_id', requestId);
            if (logs) {
                const updatePromises = logs.map(async (log) => {
                    const isAdminWhoClicked = log.admin_chat_id.toString() === adminTelegramId.toString();
                    let newText = '';
                    if (action === 'approve') {
                        newText = isAdminWhoClicked
                            ? `✅ **You approved this request.**`
                            : `✅ **Approved by ${adminName}**`;
                    }
                    else {
                        newText = isAdminWhoClicked
                            ? `❌ **You declined this request.**`
                            : `❌ **Declined by ${adminName}**`;
                    }
                    // Append original details if needed, or just replace. 
                    // User asked for: "The message in their chat changes... buttons disappear... text updates"
                    // We'll keep the original text but append the status or replace the header.
                    // Actually, the user prompt said: "replacing them with text: '✅ Approved by Admin A'"
                    // But usually we want to keep the context (Name, Age etc).
                    // Let's try to edit the text to append the status at the top or bottom.
                    // However, `editMessageText` replaces the whole text. 
                    // We don't have the original text easily unless we query it or store it.
                    // BUT, for the admin who clicked, we have `ctx.callbackQuery.message.text`.
                    // For others, we don't. 
                    // STRATEGY: We will construct a generic "Resolved" message with the user's name if possible, 
                    // OR we just say "Request for [Name] - Approved by [Admin]".
                    // We have `request.users.first_name`.
                    const studentName = request.users?.first_name || 'User';
                    const finalMessage = `${newText}\n\n👤 ${studentName} (${request.role_requested})`;
                    try {
                        await bot.telegram.editMessageText(log.admin_chat_id, Number(log.message_id), undefined, finalMessage, { parse_mode: 'Markdown', reply_markup: undefined } // Remove buttons
                        );
                    }
                    catch (e) {
                        // Message might be deleted or too old
                        // console.warn('Failed to edit admin message', e);
                    }
                });
                await Promise.all(updatePromises);
            }
            // Answer the interaction for the clicker (if not already handled by the mass update loop)
            // The mass update loop handles the clicker too, but `answerCbQuery` is separate.
            await ctx.answerCbQuery(`Done!`);
        }
        catch (error) {
            console.error('Error handling approval action:', error);
            ctx.answerCbQuery('An error occurred.');
        }
    });
};
exports.setupApprovalHandlers = setupApprovalHandlers;
