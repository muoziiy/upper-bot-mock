import express from 'express';
import { supabase } from '../supabase';

const router = express.Router();

// Create a new exam
router.post('/exams', async (req, res) => {
    const { title, description, group_id, duration_minutes } = req.body;
    const teacherId = req.headers['x-user-id'];

    try {
        const { data, error } = await supabase
            .from('exams')
            .insert({
                title,
                description,
                teacher_id: teacherId,
                group_id,
                duration_minutes
            })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get teacher's groups
router.get('/groups', async (req, res) => {
    const teacherId = req.headers['x-user-id'];

    try {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('teacher_id', teacherId);

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get teacher's payments
router.get('/payments', async (req, res) => {
    const telegramId = req.headers['x-user-id'];

    try {
        // Get user UUID from Telegram ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('telegram_id', telegramId)
            .single();

        if (userError || !user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const { data, error } = await supabase
            .from('teacher_payments')
            .select('*')
            .eq('teacher_id', user.id)
            .order('payment_date', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching teacher payments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
