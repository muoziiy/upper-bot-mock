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

export default router;
