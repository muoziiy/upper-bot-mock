import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

// GET /api/students/streak - Get streak data
router.get('/streak', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('telegram_id', userId)
            .single();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { data: streak } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user.id)
            .single();

        res.json(streak || {
            current_streak: 0,
            longest_streak: 0,
            total_active_days: 0,
            last_activity_date: null,
        });
    } catch (error) {
        console.error('Streak fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/students/streak - Record daily activity
router.post('/streak', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const { study_minutes, tests_completed, questions_answered } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('telegram_id', userId)
            .single();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const today = new Date().toISOString().split('T')[0];

        // Upsert activity for today
        const { data: activity, error } = await supabase
            .from('user_activity')
            .upsert({
                user_id: user.id,
                activity_date: today,
                study_minutes: study_minutes || 0,
                tests_completed: tests_completed || 0,
                questions_answered: questions_answered || 0,
            }, {
                onConflict: 'user_id,activity_date',
                ignoreDuplicates: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Activity upsert error:', error);
            return res.status(500).json({ error: 'Failed to record activity' });
        }

        // Fetch updated streak
        const { data: streak } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user.id)
            .single();

        res.json({
            activity,
            streak: streak || { current_streak: 0, longest_streak: 0 },
        });
    } catch (error) {
        console.error('Streak update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
