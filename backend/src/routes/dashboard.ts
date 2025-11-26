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

        // 1. Get User's Groups
        const { data: groupMembers } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('student_id', user.id);

        const groupIds = groupMembers?.map(g => g.group_id) || [];

        // 2. Fetch Scheduled Lessons (Real Data)
        let lessons: any[] = [];
        if (groupIds.length > 0) {
            const { data: fetchedLessons } = await supabase
                .from('scheduled_lessons')
                .select(`
                    *,
                    subjects (name, id),
                    users (first_name, last_name)
                `)
                .in('group_id', groupIds)
                .order('scheduled_date', { ascending: true });
            lessons = fetchedLessons || [];
        }

        // 3. Fetch Homework (Real Data)
        let homework: any[] = [];
        if (groupIds.length > 0) {
            const { data: fetchedHomework } = await supabase
                .from('homework')
                .select(`
                    *,
                    scheduled_lessons (title),
                    users (first_name, last_name)
                `)
                .in('group_id', groupIds)
                .order('created_at', { ascending: false });
            homework = fetchedHomework || [];
        }

        // 4. Fetch User's Assigned Subjects (from user.subjects column)
        let subjects: any[] = [];
        if (user.subjects && Array.isArray(user.subjects) && user.subjects.length > 0) {
            const { data: fetchedSubjects } = await supabase
                .from('subjects')
                .select('id, name')
                .in('id', user.subjects);
            subjects = fetchedSubjects || [];
        }
        // If no subjects assigned to user, show empty list (strict filtering as requested)

        // 5. Fetch streak data
        const { data: streak } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // 6. Fetch today's activity
        const { data: todayActivity } = await supabase
            .from('user_activity')
            .select('*')
            .eq('user_id', user.id)
            .eq('activity_date', new Date().toISOString().split('T')[0])
            .single();

        // 7. Fetch total stats
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

        res.json({
            user: {
                id: user.id,
                first_name: user.first_name,
                role: user.role,
            },
            streak: streak || { current_streak: 0, longest_streak: 0, total_active_days: 0 },
            today_activity: todayActivity || { study_minutes: 0, tests_completed: 0, questions_answered: 0 },
            total_stats: totalStats,
            lessons: lessons,
            homework: homework,
            subjects: subjects, // Filtered by user's assigned subjects
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
