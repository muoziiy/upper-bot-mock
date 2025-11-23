import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

// GET /api/students/journey - Fetch complete journey data
router.get('/journey', async (req: Request, res: Response) => {
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

        // Fetch or create user's current level
        let { data: userLevel } = await supabase
            .from('user_current_level')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // If no level exists, create beginner level
        if (!userLevel) {
            const { data: newLevel } = await supabase
                .from('user_current_level')
                .insert({
                    user_id: user.id,
                    current_level: 'beginner',
                    progress_percentage: 0
                })
                .select()
                .single();
            userLevel = newLevel;
        }

        // Fetch curriculum for user's current level
        const { data: curriculum } = await supabase
            .from('curriculum')
            .select('*')
            .eq('level', userLevel?.current_level || 'beginner')
            .eq('is_active', true)
            .order('order_index', { ascending: true });

        // Fetch all lessons for the curriculum with progress
        let lessonsWithProgress: any[] = [];

        if (curriculum && curriculum.length > 0) {
            const curriculumIds = curriculum.map((c: any) => c.id);

            const { data: lessons } = await supabase
                .from('lessons')
                .select('*')
                .in('curriculum_id', curriculumIds)
                .eq('is_active', true)
                .order('order_index', { ascending: true });

            if (lessons && lessons.length > 0) {
                const lessonIds = lessons.map((l: any) => l.id);

                const { data: progress } = await supabase
                    .from('user_lesson_progress')
                    .select('*')
                    .eq('user_id', user.id)
                    .in('lesson_id', lessonIds);

                // Merge lessons with progress
                lessonsWithProgress = lessons.map((lesson: any) => {
                    const lessonProgress = progress?.find((p: any) => p.lesson_id === lesson.id);
                    return {
                        ...lesson,
                        progress: lessonProgress || null
                    };
                });
            }
        }

        // Fetch upcoming exam schedules with exam details
        const { data: upcomingExamSchedules } = await supabase
            .from('exam_schedule')
            .select(`
                *,
                exams:exam_id (
                    title,
                    description,
                    duration_minutes
                )
            `)
            .eq('is_cancelled', false)
            .gte('scheduled_date', new Date().toISOString())
            .order('scheduled_date', { ascending: true })
            .limit(10);

        res.json({
            userLevel: userLevel || {
                user_id: user.id,
                current_level: 'beginner',
                progress_percentage: 0
            },
            curriculum: curriculum || [],
            lessons: lessonsWithProgress || [],
            upcomingExams: upcomingExamSchedules || []
        });
    } catch (error) {
        console.error('Journey data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
