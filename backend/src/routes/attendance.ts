import express from 'express';
import { supabase } from '../supabase';

const router = express.Router();

// Save Attendance
router.post('/', async (req, res) => {
    const { student_id, group_id, date, status } = req.body;

    try {
        const { data, error } = await supabase
            .from('attendance_records')
            .upsert({
                student_id,
                group_id,
                date,
                status
            }, { onConflict: 'student_id, group_id, date' })
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
