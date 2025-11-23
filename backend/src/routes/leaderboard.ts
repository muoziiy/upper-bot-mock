import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

// GET /api/leaderboard?category=global&period=all-time&limit=50
router.get('/', async (req: Request, res: Response) => {
    const { category = 'global', period = 'all-time', limit = 50 } = req.query;
    const userId = req.headers['x-user-id'] as string;

    try {
        // Fetch leaderboard entries
        let query = supabase
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
            .eq('category', category as string)
            .eq('period', period as string)
            .order('rank', { ascending: true })
            .limit(parseInt(limit as string));

        const { data: leaderboard, error } = await query;

        if (error) {
            console.error('Leaderboard fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch leaderboard' });
        }

        // Find current user's ranking
        let userRank = null;
        if (userId) {
            const { data: user } = await supabase
                .from('users')
                .select('id')
                .eq('telegram_id', userId)
                .single();

            if (user) {
                const { data: userEntry } = await supabase
                    .from('leaderboard_entries')
                    .select('rank, score')
                    .eq('user_id', user.id)
                    .eq('category', category as string)
                    .eq('period', period as string)
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
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/leaderboard/refresh - Manually refresh leaderboard (admin only)
router.post('/refresh', async (req: Request, res: Response) => {
    const { category } = req.body;

    try {
        if (category === 'global') {
            await supabase.rpc('update_global_leaderboard');
        } else if (category === 'weekly') {
            await supabase.rpc('update_weekly_leaderboard');
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Leaderboard refresh error:', error);
        res.status(500).json({ error: 'Failed to refresh leaderboard' });
    }
});

export default router;
