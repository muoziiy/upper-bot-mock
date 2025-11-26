"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../supabase");
const bot_1 = __importDefault(require("../bot"));
const logger_1 = require("../logger");
const router = express_1.default.Router();
// Helper to notify admins
const notifyAdmins = async (message, payload) => {
    try {
        // Fetch all admins and super_admins
        const { data: admins, error } = await supabase_1.supabase
            .from('users')
            .select('telegram_id')
            .in('role', ['admin', 'super_admin']);
        if (error || !admins) {
            console.error('Failed to fetch admins for notification', error);
            return;
        }
        for (const admin of admins) {
            if (admin.telegram_id) {
                try {
                    await bot_1.default.telegram.sendMessage(admin.telegram_id, message, {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '✅ Approve', callback_data: `approve_${payload.type}_${payload.userId}` },
                                    { text: '❌ Decline', callback_data: `decline_${payload.type}_${payload.userId}` }
                                ]
                            ]
                        }
                    });
                }
                catch (e) {
                    console.error(`Failed to send notification to admin ${admin.telegram_id}`, e);
                }
            }
        }
    }
    catch (e) {
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
        const { error } = await supabase_1.supabase
            .from('users')
            .update({
            first_name: name,
            surname: surname,
            age: age,
            sex: sex,
            phone_number: phoneNumber,
            role: 'guest', // Set to guest initially
            updated_at: new Date().toISOString()
        })
            .eq('telegram_id', userId);
        if (error)
            throw error;
        (0, logger_1.logInfo)('Student onboarding submitted', {
            ...(0, logger_1.getRequestInfo)(req),
            action: 'student_onboarding',
            userId: userId
        });
        // Notify Admins (Non-blocking)
        const message = `🆕 **New Student Request**\n\n👤 **Name:** ${name} ${surname}\n🎂 **Age:** ${age}\n⚧ **Sex:** ${sex}`;
        // Do not await to prevent blocking response if telegram fails
        notifyAdmins(message, { type: 'student', userId }).catch(e => {
            (0, logger_1.logWarning)('Failed to notify admins', {
                action: 'notify_admins',
                userId: userId,
                additionalInfo: { error: e?.message }
            });
        });
        res.json({ success: true, message: 'Student onboarding submitted' });
    }
    catch (error) {
        (0, logger_1.logError)(error, {
            ...(0, logger_1.getRequestInfo)(req),
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
        const { error: userError } = await supabase_1.supabase
            .from('users')
            .update({
            first_name: name,
            surname: surname,
            age: age,
            sex: sex,
            bio: bio,
            role: 'waiting_staff',
            updated_at: new Date().toISOString()
        })
            .eq('telegram_id', userId);
        if (userError)
            throw userError;
        // Add subjects (assuming subjects is an array of subject IDs)
        if (Array.isArray(subjects) && subjects.length > 0) {
            const teacherSubjects = subjects.map(subjectId => ({
                teacher_id: userId,
                subject_id: subjectId
            }));
            const { error: subjectsError } = await supabase_1.supabase
                .from('teacher_subjects')
                .insert(teacherSubjects);
            if (subjectsError) {
                (0, logger_1.logWarning)('Error adding teacher subjects', {
                    action: 'staff_onboarding_subjects',
                    userId: userId,
                    additionalInfo: { error: subjectsError?.message }
                });
            }
        }
        (0, logger_1.logInfo)('Staff onboarding submitted', {
            ...(0, logger_1.getRequestInfo)(req),
            action: 'staff_onboarding',
            userId: userId
        });
        // Notify Admins
        const message = `👨‍🏫 **New Staff Request**\n\n👤 **Name:** ${name} ${surname}\n🎂 **Age:** ${age}\n⚧ **Sex:** ${sex}\n📚 **Subjects:** ${subjects.length} selected\n📝 **Bio:** ${bio || 'N/A'}`;
        await notifyAdmins(message, { type: 'staff', userId });
        res.json({ success: true, message: 'Staff onboarding submitted' });
    }
    catch (error) {
        (0, logger_1.logError)(error, {
            ...(0, logger_1.getRequestInfo)(req),
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
        const { error } = await supabase_1.supabase
            .from('users')
            .update({
            role: 'waiting_user',
            updated_at: new Date().toISOString()
        })
            .eq('telegram_id', userId);
        if (error)
            throw error;
        res.json({ success: true, message: 'User set to waiting status' });
    }
    catch (error) {
        console.error('Error in existing user request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get Subjects List
router.get('/subjects', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('subjects')
            .select('*')
            .order('name');
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
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
        const { error } = await supabase_1.supabase
            .from('users')
            .update({
            role: 'new_user',
            updated_at: new Date().toISOString()
        })
            .eq('telegram_id', userId);
        if (error)
            throw error;
        res.json({ success: true, message: 'User role reset' });
    }
    catch (error) {
        console.error('Error in reset user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
