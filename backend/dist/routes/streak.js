"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../supabase");
const router = (0, express_1.Router)();
// GET /api/students/streak - Get streak data
router.get('/streak', async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const { data: user } = await supabase_1.supabase
            .from('users')
            .select('id')
            .eq('telegram_id', userId)
            .single();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { data: streak } = await supabase_1.supabase
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
    }
    catch (error) {
        console.error('Streak fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/students/streak - Record daily activity
router.post('/streak', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { study_minutes, tests_completed, questions_answered } = req.body;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const { data: user } = await supabase_1.supabase
            .from('users')
            .select('id')
            .eq('telegram_id', userId)
            .single();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const today = new Date().toISOString().split('T')[0];
        // Upsert activity for today
        const { data: activity, error } = await supabase_1.supabase
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
        const { data: streak } = await supabase_1.supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user.id)
            .single();
        res.json({
            activity,
            streak: streak || { current_streak: 0, longest_streak: 0 },
        });
    }
    catch (error) {
        console.error('Streak update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
