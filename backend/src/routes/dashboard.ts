import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

// GET /api/students/dashboard - Fetch dashboard data
router.get('/dashboard', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Fetch user data
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', userId)
            .single();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch streak data
        const { data: streak } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // Fetch today's activity
        const { data: todayActivity } = await supabase
            .from('user_activity')
            .select('*')
            .eq('user_id', user.id)
            .eq('activity_date', new Date().toISOString().split('T')[0])
            .single();

        // Fetch total stats
        const { data: totalActivity } = await supabase
            .from('user_activity')
            .select('study_minutes, tests_completed, questions_answered')
            .eq('user_id', user.id);

        const totalStats = totalActivity?.reduce(
            (acc, curr) => ({
                total_study_minutes: acc.total_study_minutes + (curr.study_minutes || 0),
                total_tests: acc.total_tests + (curr.tests_completed || 0),
                total_questions: acc.total_questions + (curr.questions_answered || 0),
            }),
            { total_study_minutes: 0, total_tests: 0, total_questions: 0 }
        );

        // Fetch upcoming exams
        const { data: upcomingExams } = await supabase
            .from('exams')
            .select('id, title, description, start_time, end_time')
            .eq('is_published', true)
            .gte('end_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(5);

        // Calculate average score
        const { data: results } = await supabase
            .from('exam_results')
            .select('score, total_points')
            .eq('student_id', user.id)
            .eq('is_completed', true);

        const averageScore = results && results.length > 0
            ? results.reduce((acc, curr) => acc + (curr.score / curr.total_points) * 100, 0) / results.length
            : 0;

        res.json({
            user: {
                id: user.id,
                first_name: user.first_name,
                role: user.role,
            },
            streak: streak || { current_streak: 0, longest_streak: 0, total_active_days: 0 },
            today_activity: todayActivity || { study_minutes: 0, tests_completed: 0, questions_answered: 0 },
            total_stats: totalStats,
            average_score: Math.round(averageScore),
            upcoming_exams: upcomingExams || [],
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
