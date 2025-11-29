import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';
import { checkStudentStatus, GroupConfig, StudentEnrollment } from '../utils/paymentLogic';

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
            .select(`
                id,
                telegram_id,
                first_name,
                onboarding_first_name,
                last_name,
                username,
                role,
                payment_day,
                student_id,
                subjects
            `)
            .eq('telegram_id', userId)
            .single();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 1. Get User's Groups with details
        const { data: groupMembers } = await supabase
            .from('group_members')
            .select(`
                group_id,
                payment_status,
                groups (
                    id,
                    name,
                    price,
                    payment_type,
                    teacher_id
                ),
                anchor_day,
                lessons_remaining,
                next_due_date,
                last_payment_date,
                joined_at
            `)
            .eq('student_id', user.id);

        const groupIds = groupMembers?.map(g => g.group_id) || [];

        // Fetch Teachers for these groups
        const teacherIds = groupMembers?.map((g: any) => {
            const group = Array.isArray(g.groups) ? g.groups[0] : g.groups;
            return group?.teacher_id;
        }).filter(Boolean) || [];

        let teachersMap = new Map();
        if (teacherIds.length > 0) {
            const { data: teachers } = await supabase
                .from('users')
                .select('id, first_name, surname, email, phone_number')
                .in('id', teacherIds);

            teachers?.forEach(t => teachersMap.set(t.id, t));
        }

        // Fetch Payments for these groups
        const { data: payments } = await supabase
            .from('payment_records')
            .select('*')
            .eq('student_id', user.id)
            .in('group_id', groupIds)
            .order('payment_date', { ascending: false });

        // Construct rich groups data for Profile
        const richGroups = groupMembers?.map((gm: any) => {
            const group = Array.isArray(gm.groups) ? gm.groups[0] : gm.groups;
            if (!group) return null;

            const teacher = teachersMap.get(group.teacher_id);
            const groupPayments = payments?.filter(p => p.group_id === group.id) || [];

            return {
                id: group.id,
                name: group.name,
                price: group.price,
                payment_type: group.payment_type,
                status: gm.payment_status || 'paid',
                lessons_remaining: gm.lessons_remaining,
                next_due_date: gm.next_due_date,
                teacher: teacher ? {
                    id: teacher.id,
                    first_name: teacher.first_name,
                    last_name: teacher.surname,
                    phone: teacher.phone_number
                } : null,
                payments: groupPayments,
                attendance: []
            };
        }).filter(Boolean) || [];

        // 2. Fetch Scheduled Lessons
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

        // 3. Fetch Homework
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

        // 4. Fetch User's Assigned Subjects
        let subjects: any[] = [];
        if (user.subjects && Array.isArray(user.subjects) && user.subjects.length > 0) {
            const { data: fetchedSubjects } = await supabase
                .from('subjects')
                .select('id, name')
                .in('id', user.subjects);
            subjects = fetchedSubjects || [];
        }

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
                student_id: user.student_id
            },
            streak: streak || { current_streak: 0, longest_streak: 0, total_active_days: 0 },
            today_activity: todayActivity || { study_minutes: 0, tests_completed: 0, questions_answered: 0 },
            total_stats: totalStats,
            lessons: lessons,
            homework: homework,
            subjects: subjects,
            groups: richGroups
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
