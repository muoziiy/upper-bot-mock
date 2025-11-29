import express from 'express';
import { supabase } from '../supabase';
import bot from '../bot';
import { logError, logWarning, logInfo, getRequestInfo } from '../logger';
import { notifyAdminsOfNewRequest } from '../approval';

const router = express.Router();

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
        const details = `👤 **Name:** ${name} ${surname}\n🎂 **Age:** ${age}\n🚻 **Sex:** ${sex}\n📞 **Phone:** ${phoneNumber}`;

        // Do not await to prevent blocking response if telegram fails
        notifyAdminsOfNewRequest(bot, {
            type: 'student',
            userId,
            name: `${name} ${surname}`,
            details
        }).catch(e => {
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
        const details = `👤 **Name:** ${name} ${surname}\n🎂 **Age:** ${age}\n⚧ **Sex:** ${sex}\n📚 **Subjects:** ${subjects.length} selected\n📝 **Bio:** ${bio || 'N/A'}`;

        await notifyAdminsOfNewRequest(bot, {
            type: 'staff',
            userId,
            name: `${name} ${surname}`,
            details
        });

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
