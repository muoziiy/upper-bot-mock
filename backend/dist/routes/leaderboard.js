"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../supabase");
const router = (0, express_1.Router)();
// GET /api/leaderboard?category=global&period=all-time&limit=50
router.get('/', async (req, res) => {
    const { category = 'global', period = 'all-time', limit = 50 } = req.query;
    const userId = req.headers['x-user-id'];
    try {
        // Fetch leaderboard entries
        let query = supabase_1.supabase
            .from('leaderboard_entries')
            .select(`
        rank,
        score,
        user_id,
        users (
          first_name,
          telegram_id
        )
      `)
            .eq('category', category)
            .eq('period', period)
            .order('rank', { ascending: true })
            .limit(parseInt(limit));
        const { data: leaderboard, error } = await query;
        if (error) {
            console.error('Leaderboard fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch leaderboard' });
        }
        // Find current user's ranking
        let userRank = null;
        if (userId) {
            const { data: user } = await supabase_1.supabase
                .from('users')
                .select('id')
                .eq('telegram_id', userId)
                .single();
            if (user) {
                const { data: userEntry } = await supabase_1.supabase
                    .from('leaderboard_entries')
                    .select('rank, score')
                    .eq('user_id', user.id)
                    .eq('category', category)
                    .eq('period', period)
                    .single();
                userRank = userEntry;
            }
        }
        res.json({
            leaderboard,
            user_rank: userRank,
            category,
            period,
        });
    }
    catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/leaderboard/refresh - Manually refresh leaderboard (admin only)
router.post('/refresh', async (req, res) => {
    const { category } = req.body;
    try {
        if (category === 'global') {
            await supabase_1.supabase.rpc('update_global_leaderboard');
        }
        else if (category === 'weekly') {
            await supabase_1.supabase.rpc('update_weekly_leaderboard');
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Leaderboard refresh error:', error);
        res.status(500).json({ error: 'Failed to refresh leaderboard' });
    }
});
exports.default = router;
