import { Telegraf, Markup } from 'telegraf';
import { supabase } from './supabase';
import { config } from './config';

const bot = new Telegraf(config.botToken);

// Handle /start command
bot.start(async (ctx) => {
    const user = ctx.from;
    const text = 'text' in ctx.message ? ctx.message.text : '';
    const startPayload = text.split(' ')[1] || '';

    if (!user) {
        return ctx.reply('Unable to identify user.');
    }

    try {
        const { data: existingUser } = await supabase
            .from('users')
            .select('role')
            .eq('telegram_id', user.id)
            .single();

        let error;

        if (existingUser) {
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    username: user.username || null,
                    first_name: user.first_name,
                    last_name: user.last_name || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('telegram_id', user.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
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

        let webAppUrl = config.miniAppUrl;
        if (startPayload) {
            const separator = webAppUrl.includes('?') ? '&' : '?';
            webAppUrl = `${webAppUrl}${separator}start_param=${startPayload}`;
        }

        try {
            await ctx.reply(
                `Welcome, ${user.first_name}! 🎓\n\nClick the button below to open the Education Center app.`,
                {
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
                }
            );
        } catch (replyError) {
            console.error('Failed to send welcome message (likely network timeout):', replyError);
            // User is registered in DB, but we couldn't send the message
            // This is acceptable - they can still access the app
        }
    } catch (error) {
        console.error('Error in /start handler:', error);
        // Don't reply if we're already in an error state
        try {
            await ctx.reply('An error occurred. Please try again later.');
        } catch (e) {
            console.error('Failed to send error message:', e);
        }
    }
});

// Handle /addadmin command
bot.command('addadmin', async (ctx) => {
    const user = ctx.from;
    if (!user) return;

    try {
        // 1. Check if user exists and get their DB ID
        const { data: userData, error: userError } = await supabase
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
        const { data: existingRequest } = await supabase
            .from('admin_requests')
            .select('status')
            .eq('user_id', userData.id)
            .eq('status', 'pending')
            .single();

        if (existingRequest) {
            return ctx.reply('You already have a pending request.');
        }

        // 3. Create request
        const { data: request, error: requestError } = await supabase
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
        const { data: superAdmins } = await supabase
            .from('users')
            .select('telegram_id')
            .eq('role', 'super_admin');

        if (superAdmins && superAdmins.length > 0) {
            const requesterName = `${userData.first_name} ${userData.last_name || ''}`.trim();
            const username = userData.username ? `@${userData.username}` : 'No username';

            for (const admin of superAdmins) {
                try {
                    await ctx.telegram.sendMessage(
                        Number(admin.telegram_id),
                        `🔔 **New Admin Request**\n\nUser: ${requesterName}\nUsername: ${username}\nID: ${userData.id}`,
                        {
                            parse_mode: 'Markdown',
                            ...Markup.inlineKeyboard([
                                Markup.button.callback('✅ Approve', `approve_admin:${request.id}`),
                                Markup.button.callback('❌ Decline', `decline_admin:${request.id}`)
                            ])
                        }
                    );
                } catch (e) {
                    console.error(`Failed to notify super admin ${admin.telegram_id}:`, e);
                }
            }
        }

    } catch (error) {
        console.error('Error in /addadmin:', error);
        ctx.reply('An error occurred.');
    }
});

// Handle Admin Approval/Decline Actions
bot.action(/^(approve|decline)_admin:(.+)$/, async (ctx) => {
    const action = ctx.match[1]; // 'approve' or 'decline'
    const requestId = ctx.match[2];
    const adminTelegramId = ctx.from?.id;

    if (!adminTelegramId) return;

    try {
        // Verify the clicker is a Super Admin
        const { data: adminUser } = await supabase
            .from('users')
            .select('role')
            .eq('telegram_id', adminTelegramId)
            .single();

        if (!adminUser || adminUser.role !== 'super_admin') {
            return ctx.answerCbQuery('You are not authorized to perform this action.');
        }

        // Get request details
        const { data: request } = await supabase
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
            await supabase
                .from('admin_requests')
                .update({ status: 'approved', updated_at: new Date().toISOString() })
                .eq('id', requestId);

            // Update user role
            await supabase
                .from('users')
                .update({ role: 'admin' })
                .eq('id', request.user_id);

            await ctx.editMessageText(`✅ Request approved by you.`);

            // Notify user
            if (request.users?.telegram_id) {
                await ctx.telegram.sendMessage(Number(request.users.telegram_id), '🎉 Your request to become an admin has been approved!');
            }
        } else {
            // Decline
            await supabase
                .from('admin_requests')
                .update({ status: 'declined', updated_at: new Date().toISOString() })
                .eq('id', requestId);

            await ctx.editMessageText(`❌ Request declined by you.`);

            // Notify user
            if (request.users?.telegram_id) {
                await ctx.telegram.sendMessage(Number(request.users.telegram_id), 'Your request to become an admin has been declined.');
            }
        }

    } catch (error) {
        console.error('Error handling admin action:', error);
        ctx.answerCbQuery('An error occurred.');
    }
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Handle Student/Staff Approval/Decline Actions
bot.action(/^(approve|decline)_(student|staff)_(.+)$/, async (ctx) => {
    const action = ctx.match[1]; // 'approve' or 'decline'
    const type = ctx.match[2]; // 'student' or 'staff'
    const userId = ctx.match[3];
    const adminTelegramId = ctx.from?.id;

    if (!adminTelegramId) return;

    try {
        // Verify the clicker is an Admin or Super Admin
        const { data: adminUser } = await supabase
            .from('users')
            .select('role')
            .eq('telegram_id', adminTelegramId)
            .single();

        if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
            return ctx.answerCbQuery('You are not authorized to perform this action.');
        }

        // Get target user details
        const { data: targetUser } = await supabase
            .from('users')
            .select('telegram_id, first_name, role')
            .eq('id', userId)
            .single();

        if (!targetUser) {
            return ctx.answerCbQuery('User not found.');
        }

        // Check if already processed (simple check based on current role)
        // If approving a student, role should be 'guest'. If approving staff, role should be 'waiting_staff'.
        // If already 'student' or 'teacher', it's done.
        if (type === 'student' && targetUser.role === 'student') {
            return ctx.editMessageText(`✅ Request already approved.`);
        }
        if (type === 'staff' && targetUser.role === 'teacher') {
            return ctx.editMessageText(`✅ Request already approved.`);
        }

        if (action === 'approve') {
            const newRole = type === 'student' ? 'student' : 'teacher';

            // Update user role
            await supabase
                .from('users')
                .update({ role: newRole, updated_at: new Date().toISOString() })
                .eq('id', userId);

            await ctx.editMessageText(`✅ ${type === 'student' ? 'Student' : 'Staff'} approved by ${ctx.from.first_name}.`);

            // Notify user
            if (targetUser.telegram_id) {
                const msg = type === 'student'
                    ? '🎉 Your account has been approved! You can now access the full student dashboard.'
                    : '🎉 Your teacher account has been approved! You can now access the teacher dashboard.';
                await ctx.telegram.sendMessage(Number(targetUser.telegram_id), msg);
            }
        } else {
            // Decline - maybe set to guest or keep as is but notify? 
            // For now, let's just notify and maybe set to guest if it was waiting_staff?
            // If student (guest) is declined, maybe nothing changes or block? 
            // User said "approve or decline".

            await ctx.editMessageText(`❌ ${type === 'student' ? 'Student' : 'Staff'} request declined by ${ctx.from.first_name}.`);

            // Notify user
            if (targetUser.telegram_id) {
                await ctx.telegram.sendMessage(Number(targetUser.telegram_id), 'Your registration request has been declined. Please contact support.');
            }
        }

    } catch (error) {
        console.error('Error handling onboarding action:', error);
        ctx.answerCbQuery('An error occurred.');
    }
});

export default bot;
