import express from 'express';
import { supabase } from '../supabase';
import bot from '../bot';
import { logError, logWarning, logInfo, getRequestInfo } from '../logger';

const router = express.Router();

// Helper to notify admins and track request
const notifyAdmins = async (message: string, payload: { type: 'student' | 'staff', userId: number }) => {
    try {
        // 1. Create Registration Request Record
        const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('telegram_id', payload.userId)
            .single();

        if (!userData) {
            console.error('User not found for request creation');
            return;
        }

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
            console.error('Failed to create registration request', reqError);
            return;
        }

        // 2. Fetch Admins
        const { data: admins, error } = await supabase
            .from('users')
            .select('telegram_id')
            .in('role', ['admin', 'super_admin']);

        if (error || !admins) {
            console.error('Failed to fetch admins for notification', error);
            return;
        }

        // 3. Send Messages and Track IDs
        const sentMessages: { chat_id: number, message_id: number }[] = [];

        for (const admin of admins) {
            if (admin.telegram_id) {
                try {
                    const sentMsg = await bot.telegram.sendMessage(admin.telegram_id, message, {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '✅ Approve', callback_data: `approve_${payload.type}_${request.id}` },
                                    { text: '❌ Decline', callback_data: `decline_${payload.type}_${request.id}` }
                                ]
                            ]
                        }
                    });
                    sentMessages.push({ chat_id: sentMsg.chat.id, message_id: sentMsg.message_id });
                } catch (e) {
                    console.error(`Failed to send notification to admin ${admin.telegram_id}`, e);
                }
            }
        }

        // 4. Update Request with Message IDs (using admin_notification_logs)
        if (sentMessages.length > 0) {
            const logs = sentMessages.map(msg => ({
                request_id: request.id,
                admin_chat_id: msg.chat_id,
                message_id: msg.message_id
            }));

            const { error: logError } = await supabase
                .from('admin_notification_logs')
                .insert(logs);

            if (logError) {
                console.error('Failed to insert admin notification logs', logError);
            }
        }

    } catch (e) {
        console.error('Error in notifyAdmins', e);
    }
};

// New Student Onboarding
router.post('/student', async (req, res) => {
    const { userId, name, surname, age, sex, phoneNumber } = req.body;

    if (!userId || !name || !surname || !age || !sex || !phoneNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const { error } = await supabase
            .from('users')
            .update({
                onboarding_first_name: name,
                surname: surname,
                age: age,
                sex: sex,
                phone_number: phoneNumber,
                role: 'guest', // Set to guest initially
                updated_at: new Date().toISOString()
            })
            .eq('telegram_id', userId);

        if (error) throw error;

        logInfo('Student onboarding submitted', {
            ...getRequestInfo(req),
            action: 'student_onboarding',
            userId: userId
        });

        // Notify Admins (Non-blocking)
        const message = `🆕 **New Student Request**\n\n👤 **Name:** ${name} ${surname}\n🎂 **Age:** ${age}\n🚻 **Sex:** ${sex}`;
        // Do not await to prevent blocking response if telegram fails
        notifyAdmins(message, { type: 'student', userId }).catch(e => {
            logWarning('Failed to notify admins', {
                action: 'notify_admins',
                userId: userId,
                additionalInfo: { error: e?.message }
            });
        });

        res.json({ success: true, message: 'Student onboarding submitted' });
    } catch (error) {
        logError(error, {
            ...getRequestInfo(req),
            action: 'student_onboarding',
            userId: userId,
            additionalInfo: { name, surname, age, sex }
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Staff Onboarding
router.post('/staff', async (req, res) => {
    const { userId, name, surname, age, sex, subjects, bio } = req.body;

    if (!userId || !name || !surname || !age || !sex || !subjects) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Update user profile
        const { error: userError } = await supabase
            .from('users')
            .update({
                onboarding_first_name: name,
                surname: surname,
                age: age,
                sex: sex,
                bio: bio,
                role: 'waiting_staff',
                updated_at: new Date().toISOString()
            })
            .eq('telegram_id', userId);

        if (userError) throw userError;

        // Add subjects (assuming subjects is an array of subject IDs)
        if (Array.isArray(subjects) && subjects.length > 0) {
            const teacherSubjects = subjects.map(subjectId => ({
                teacher_id: userId,
                subject_id: subjectId
            }));

            const { error: subjectsError } = await supabase
                .from('teacher_subjects')
                .insert(teacherSubjects);

            if (subjectsError) {
                logWarning('Error adding teacher subjects', {
                    action: 'staff_onboarding_subjects',
                    userId: userId,
                    additionalInfo: { error: subjectsError?.message }
                });
            }
        }

        logInfo('Staff onboarding submitted', {
            ...getRequestInfo(req),
            action: 'staff_onboarding',
            userId: userId
        });

        // Notify Admins
        const message = `👨‍🏫 **New Staff Request**\n\n👤 **Name:** ${name} ${surname}\n🎂 **Age:** ${age}\n⚧ **Sex:** ${sex}\n📚 **Subjects:** ${subjects.length} selected\n📝 **Bio:** ${bio || 'N/A'}`;
        await notifyAdmins(message, { type: 'staff', userId });

        res.json({ success: true, message: 'Staff onboarding submitted' });
    } catch (error) {
        logError(error, {
            ...getRequestInfo(req),
            action: 'staff_onboarding',
            userId: userId,
            additionalInfo: { name, surname, age, sex, subjectsCount: subjects?.length }
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Existing User Request
router.post('/existing', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const { error } = await supabase
            .from('users')
            .update({
                role: 'waiting_user',
                updated_at: new Date().toISOString()
            })
            .eq('telegram_id', userId);

        if (error) throw error;

        res.json({ success: true, message: 'User set to waiting status' });
    } catch (error) {
        console.error('Error in existing user request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Subjects List
router.get('/subjects', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .order('name');

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset User Role (Exit Guest Mode)
router.post('/reset', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const { error } = await supabase
            .from('users')
            .update({
                role: 'new_user',
                updated_at: new Date().toISOString()
            })
            .eq('telegram_id', userId);

        if (error) throw error;

        res.json({ success: true, message: 'User role reset' });
    } catch (error) {
        console.error('Error in reset user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
