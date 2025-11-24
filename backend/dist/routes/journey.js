"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../supabase");
const router = (0, express_1.Router)();
// GET /api/students/journey - Fetch complete journey data
router.get('/journey', async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        // Fetch user data
        const { data: user } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('telegram_id', userId)
            .single();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Fetch or create user's current level
        let { data: userLevel } = await supabase_1.supabase
            .from('user_current_level')
            .select('*')
            .eq('user_id', user.id)
            .single();
        // If no level exists, create beginner level
        if (!userLevel) {
            const { data: newLevel } = await supabase_1.supabase
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
        const { data: curriculum } = await supabase_1.supabase
            .from('curriculum')
            .select('*')
            .eq('level', userLevel?.current_level || 'beginner')
            .eq('is_active', true)
            .order('order_index', { ascending: true });
        // Fetch all lessons for the curriculum with progress
        let lessonsWithProgress = [];
        if (curriculum && curriculum.length > 0) {
            const curriculumIds = curriculum.map((c) => c.id);
            const { data: lessons } = await supabase_1.supabase
                .from('lessons')
                .select('*')
                .in('curriculum_id', curriculumIds)
                .eq('is_active', true)
                .order('order_index', { ascending: true });
            if (lessons && lessons.length > 0) {
                const lessonIds = lessons.map((l) => l.id);
                const { data: progress } = await supabase_1.supabase
                    .from('user_lesson_progress')
                    .select('*')
                    .eq('user_id', user.id)
                    .in('lesson_id', lessonIds);
                // Merge lessons with progress
                lessonsWithProgress = lessons.map((lesson) => {
                    const lessonProgress = progress?.find((p) => p.lesson_id === lesson.id);
                    return {
                        ...lesson,
                        progress: lessonProgress || null
                    };
                });
            }
        }
        // Fetch upcoming exam schedules with exam details (filtered by user's groups)
        // First get user's groups
        const { data: userGroups } = await supabase_1.supabase
            .from('group_members')
            .select('group_id')
            .eq('student_id', user.id);
        const groupIds = userGroups?.map((g) => g.group_id) || [];
        // Fetch exam schedules
        // Include global exams (group_id IS NULL) and exams for user's groups
        let examScheduleQuery = supabase_1.supabase
            .from('exam_schedule')
            .select(`
                *,
                exams:exam_id (
                    title,
                    description,
                    duration_minutes,
                    group_id
                )
            `)
            .eq('is_cancelled', false)
            .gte('scheduled_date', new Date().toISOString())
            .order('scheduled_date', { ascending: true })
            .limit(10);
        const { data: allExamSchedules } = await examScheduleQuery;
        // Filter to only include exams that are global or for user's groups
        const upcomingExamSchedules = allExamSchedules?.filter((schedule) => {
            const exam = schedule.exams;
            if (!exam)
                return false;
            // Include if exam is global (no group_id) or if user is in the exam's group
            return exam.group_id === null || groupIds.includes(exam.group_id);
        }) || [];
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
    }
    catch (error) {
        console.error('Journey data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
