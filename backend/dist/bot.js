"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const supabase_1 = require("./supabase");
const config_1 = require("./config");
const bot = new telegraf_1.Telegraf(config_1.config.botToken);
// Handle /start command
bot.start(async (ctx) => {
    const user = ctx.from;
    const text = 'text' in ctx.message ? ctx.message.text : '';
    const startPayload = text.split(' ')[1] || '';
    if (!user) {
        return ctx.reply('Unable to identify user.');
    }
    try {
        const { data: existingUser } = await supabase_1.supabase
            .from('users')
            .select('role')
            .eq('telegram_id', user.id)
            .single();
        let error;
        if (existingUser) {
            const { error: updateError } = await supabase_1.supabase
                .from('users')
                .update({
                username: user.username || null,
                first_name: user.first_name,
                last_name: user.last_name || null,
                updated_at: new Date().toISOString(),
            })
                .eq('telegram_id', user.id);
            error = updateError;
        }
        else {
            const { error: insertError } = await supabase_1.supabase
                .from('users')
                .insert({
                telegram_id: user.id,
                username: user.username || null,
                first_name: user.first_name,
                last_name: user.last_name || null,
                role: 'new_user',
                updated_at: new Date().toISOString(),
            });
            error = insertError;
        }
        if (error) {
            console.error('Error upserting user:', error);
            return ctx.reply('Something went wrong. Please try again.');
        }
        let webAppUrl = config_1.config.miniAppUrl;
        if (startPayload) {
            const separator = webAppUrl.includes('?') ? '&' : '?';
            webAppUrl = `${webAppUrl}${separator}start_param=${startPayload}`;
        }
        try {
            await ctx.reply(`Welcome, ${user.first_name}! 🎓\n\nClick the button below to open the Education Center app.`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '📚 Open Education Center',
                                web_app: { url: webAppUrl }
                            }
                        ]
                    ]
                }
            });
        }
        catch (replyError) {
            console.error('Failed to send welcome message (likely network timeout):', replyError);
            // User is registered in DB, but we couldn't send the message
            // This is acceptable - they can still access the app
        }
    }
    catch (error) {
        console.error('Error in /start handler:', error);
        // Don't reply if we're already in an error state
        try {
            await ctx.reply('An error occurred. Please try again later.');
        }
        catch (e) {
            console.error('Failed to send error message:', e);
        }
    }
});
// Handle /addadmin command
bot.command('addadmin', async (ctx) => {
    const user = ctx.from;
    if (!user)
        return;
    try {
        // 1. Check if user exists and get their DB ID
        const { data: userData, error: userError } = await supabase_1.supabase
            .from('users')
            .select('id, role, first_name, last_name, username')
            .eq('telegram_id', user.id)
            .single();
        if (userError || !userData) {
            return ctx.reply('You are not registered. Please start the bot first with /start.');
        }
        if (userData.role === 'admin' || userData.role === 'super_admin') {
            return ctx.reply('You are already an admin!');
        }
        // 2. Check for existing pending request
        const { data: existingRequest } = await supabase_1.supabase
            .from('admin_requests')
            .select('status')
            .eq('user_id', userData.id)
            .eq('status', 'pending')
            .single();
        if (existingRequest) {
            return ctx.reply('You already have a pending request.');
        }
        // 3. Create request
        const { data: request, error: requestError } = await supabase_1.supabase
            .from('admin_requests')
            .insert({ user_id: userData.id, status: 'pending' })
            .select()
            .single();
        if (requestError) {
            console.error('Error creating admin request:', requestError);
            return ctx.reply('Failed to submit request. Please try again.');
        }
        await ctx.reply('Your request to become an admin has been submitted for approval.');
        // 4. Notify Super Admins
        const { data: superAdmins } = await supabase_1.supabase
            .from('users')
            .select('telegram_id')
            .eq('role', 'super_admin');
        if (superAdmins && superAdmins.length > 0) {
            const requesterName = `${userData.first_name} ${userData.last_name || ''}`.trim();
            const username = userData.username ? `@${userData.username}` : 'No username';
            for (const admin of superAdmins) {
                try {
                    await ctx.telegram.sendMessage(Number(admin.telegram_id), `🔔 **New Admin Request**\n\nUser: ${requesterName}\nUsername: ${username}\nID: ${userData.id}`, {
                        parse_mode: 'Markdown',
                        ...telegraf_1.Markup.inlineKeyboard([
                            telegraf_1.Markup.button.callback('✅ Approve', `approve_admin:${request.id}`),
                            telegraf_1.Markup.button.callback('❌ Decline', `decline_admin:${request.id}`)
                        ])
                    });
                }
                catch (e) {
                    console.error(`Failed to notify super admin ${admin.telegram_id}:`, e);
                }
            }
        }
    }
    catch (error) {
        console.error('Error in /addadmin:', error);
        ctx.reply('An error occurred.');
    }
});
// Handle Admin Approval/Decline Actions
bot.action(/^(approve|decline)_admin:(.+)$/, async (ctx) => {
    const action = ctx.match[1]; // 'approve' or 'decline'
    const requestId = ctx.match[2];
    const adminTelegramId = ctx.from?.id;
    if (!adminTelegramId)
        return;
    try {
        // Verify the clicker is a Super Admin
        const { data: adminUser } = await supabase_1.supabase
            .from('users')
            .select('role')
            .eq('telegram_id', adminTelegramId)
            .single();
        if (!adminUser || adminUser.role !== 'super_admin') {
            return ctx.answerCbQuery('You are not authorized to perform this action.');
        }
        // Get request details
        const { data: request } = await supabase_1.supabase
            .from('admin_requests')
            .select('*, users(telegram_id, first_name)')
            .eq('id', requestId)
            .single();
        if (!request) {
            return ctx.answerCbQuery('Request not found.');
        }
        if (request.status !== 'pending') {
            return ctx.editMessageText(`Request already ${request.status}.`);
        }
        if (action === 'approve') {
            // Update request status
            await supabase_1.supabase
                .from('admin_requests')
                .update({ status: 'approved', updated_at: new Date().toISOString() })
                .eq('id', requestId);
            // Update user role
            await supabase_1.supabase
                .from('users')
                .update({ role: 'admin' })
                .eq('id', request.user_id);
            await ctx.editMessageText(`✅ Request approved by you.`);
            // Notify user
            if (request.users?.telegram_id) {
                await ctx.telegram.sendMessage(Number(request.users.telegram_id), '🎉 Your request to become an admin has been approved!');
            }
        }
        else {
            // Decline
            await supabase_1.supabase
                .from('admin_requests')
                .update({ status: 'declined', updated_at: new Date().toISOString() })
                .eq('id', requestId);
            await ctx.editMessageText(`❌ Request declined by you.`);
            // Notify user
            if (request.users?.telegram_id) {
                await ctx.telegram.sendMessage(Number(request.users.telegram_id), 'Your request to become an admin has been declined.');
            }
        }
    }
    catch (error) {
        console.error('Error handling admin action:', error);
        ctx.answerCbQuery('An error occurred.');
    }
});
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
// Handle Student/Staff Approval/Decline Actions
// Handle Student/Staff Approval/Decline Actions
// Handle Student/Staff Approval/Decline Actions
bot.action(/^(approve|decline)_(student|staff)_(.+)$/, async (ctx) => {
    const action = ctx.match[1]; // 'approve' or 'decline'
    const type = ctx.match[2]; // 'student' or 'staff'
    const requestId = ctx.match[3]; // Now this is the UUID of the request
    const adminTelegramId = ctx.from?.id;
    if (!adminTelegramId)
        return;
    try {
        // 1. Verify Admin
        const { data: adminUser } = await supabase_1.supabase
            .from('users')
            .select('id, role, first_name')
            .eq('telegram_id', adminTelegramId)
            .single();
        if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
            return ctx.answerCbQuery('You are not authorized to perform this action.');
        }
        // 2. Fetch Request
        const { data: request } = await supabase_1.supabase
            .from('registration_requests')
            .select('*, users(telegram_id, first_name)')
            .eq('id', requestId)
            .single();
        if (!request) {
            return ctx.answerCbQuery('Request not found.');
        }
        if (request.status !== 'pending') {
            return ctx.answerCbQuery(`Request already ${request.status}.`);
        }
        // 3. Process Action
        const newStatus = action === 'approve' ? 'approved' : 'declined';
        // Update Request Status
        await supabase_1.supabase
            .from('registration_requests')
            .update({
            status: newStatus,
            processed_by: adminUser.id,
            updated_at: new Date().toISOString()
        })
            .eq('id', requestId);
        // Update User Role if Approved
        if (action === 'approve') {
            const newRole = type === 'student' ? 'student' : 'teacher';
            await supabase_1.supabase
                .from('users')
                .update({ role: newRole, updated_at: new Date().toISOString() })
                .eq('id', request.user_id);
        }
        else {
            // Ensure they stay as new_user/waiting if declined
            // (Optional: maybe set to 'new_user' explicitly if they were 'waiting')
        }
        // 4. Synchronize Messages (Edit ALL admin messages)
        const messages = request.notification_messages || [];
        const originalText = ctx.callbackQuery.message && 'text' in ctx.callbackQuery.message
            ? ctx.callbackQuery.message.text
            : `New ${type} Request`;
        const cleanText = originalText.replace('🆕 **New Student Request**', '').replace('👨‍🏫 **New Staff Request**', '').trim();
        const header = action === 'approve' ? `✅ **${type === 'student' ? 'Student' : 'Staff'} Request Approved**` : `❌ **${type === 'student' ? 'Student' : 'Staff'} Request Declined**`;
        const footer = `\n\n👮‍♂️ **${action === 'approve' ? 'Approved' : 'Declined'} by:** ${adminUser.first_name}`;
        const finalText = `${header}\n\n${cleanText}${footer}`;
        // Update all messages
        for (const msg of messages) {
            try {
                await ctx.telegram.editMessageText(msg.chat_id, msg.message_id, undefined, finalText, { parse_mode: 'Markdown' });
            }
            catch (e) {
                console.error(`Failed to edit message for chat ${msg.chat_id}`, e);
            }
        }
        // 5. Notify User
        if (request.users?.telegram_id) {
            let userMsg = '';
            if (action === 'approve') {
                userMsg = type === 'student'
                    ? '🎉 Your account has been approved! You can now access the full student dashboard.'
                    : '🎉 Your teacher account has been approved! You can now access the teacher dashboard.';
            }
            else {
                userMsg = 'Your registration request has been declined. Please contact support or try again.';
            }
            await ctx.telegram.sendMessage(Number(request.users.telegram_id), userMsg);
        }
        await ctx.answerCbQuery('Action processed successfully.');
    }
    catch (error) {
        console.error('Error handling onboarding action:', error);
        ctx.answerCbQuery('An error occurred.');
    }
});
// Handle /check_unpaid command
bot.command('check_unpaid', async (ctx) => {
    const user = ctx.from;
    if (!user)
        return;
    try {
        // 1. Verify Admin
        const { data: adminUser } = await supabase_1.supabase
            .from('users')
            .select('role')
            .eq('telegram_id', user.id)
            .single();
        if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
            return ctx.reply('You are not authorized to use this command.');
        }
        await ctx.reply('🔍 Checking for unpaid students...');
        // 2. Call RPC to get overdue students
        // We use the function created in migration: get_overdue_students(target_date)
        const { data: overdueStudents, error } = await supabase_1.supabase
            .rpc('get_overdue_students', { target_date: new Date().toISOString() });
        if (error) {
            console.error('Error fetching overdue students:', error);
            return ctx.reply('Failed to fetch data. Please try again.');
        }
        if (!overdueStudents || overdueStudents.length === 0) {
            return ctx.reply('✅ No unpaid students found!');
        }
        await ctx.reply(`Found ${overdueStudents.length} students with overdue payments.`);
        // 3. Send info for each student
        for (const record of overdueStudents) {
            // Fetch student details
            const { data: student } = await supabase_1.supabase
                .from('users')
                .select('first_name, surname, phone_number, username')
                .eq('id', record.student_id)
                .single();
            // Fetch group name
            const { data: group } = await supabase_1.supabase
                .from('groups')
                .select('name')
                .eq('id', record.group_id)
                .single();
            if (student && group) {
                const message = `
⚠️ **Overdue Payment**

👤 **Student:** ${student.first_name} ${student.surname || ''}
📞 **Phone:** ${student.phone_number || 'N/A'}
🏫 **Group:** ${group.name}
💰 **Amount Due:** ${record.amount_due.toLocaleString()} UZS
reason: ${record.reason === 'monthly_payment_overdue' ? 'Monthly Payment Missing' : '12 Lessons Balance Empty'}

@${student.username || 'NoUsername'}
`;
                await ctx.reply(message, { parse_mode: 'Markdown' });
            }
        }
    }
    catch (error) {
        console.error('Error in /check_unpaid:', error);
        ctx.reply('An error occurred.');
    }
});
exports.default = bot;
