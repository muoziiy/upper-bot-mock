import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

// GET /api/students/achievements - Get all achievements with unlock status
router.get('/achievements', async (req: Request, res: Response) => {
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

        // Get all achievements
        const { data: allAchievements } = await supabase
            .from('achievements')
            .select('*')
            .order('category', { ascending: true })
            .order('points', { ascending: true });

        // Get user's unlocked achievements
        const { data: unlockedAchievements } = await supabase
            .from('user_achievements')
            .select('achievement_id, unlocked_at')
            .eq('user_id', user.id);

        const unlockedIds = new Set(unlockedAchievements?.map(a => a.achievement_id) || []);

        // Combine data
        const achievements = allAchievements?.map(achievement => ({
            ...achievement,
            unlocked: unlockedIds.has(achievement.id),
            unlocked_at: unlockedAchievements?.find(ua => ua.achievement_id === achievement.id)?.unlocked_at || null,
        }));

        // Group by category
        const groupedAchievements = achievements?.reduce((acc: any, achievement) => {
            if (!acc[achievement.category]) {
                acc[achievement.category] = [];
            }
            acc[achievement.category].push(achievement);
            return acc;
        }, {});

        // Count stats
        const stats = {
            total: achievements?.length || 0,
            unlocked: unlockedIds.size,
            total_points: achievements
                ?.filter(a => unlockedIds.has(a.id))
                .reduce((sum, a) => sum + (a.points || 0), 0) || 0,
        };

        res.json({
            achievements: groupedAchievements,
            stats,
        });
    } catch (error) {
        console.error('Achievements error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/students/achievements/check - Manually check for new achievements
router.post('/achievements/check', async (req: Request, res: Response) => {
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

        // Call the PostgreSQL function to check achievements
        const { data: newAchievements, error } = await supabase
            .rpc('check_and_unlock_achievements', { p_user_id: user.id });

        if (error) {
            console.error('Check achievements error:', error);
            return res.status(500).json({ error: 'Failed to check achievements' });
        }

        res.json({
            new_achievements: newAchievements || [],
        });
    } catch (error) {
        console.error('Achievement check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
