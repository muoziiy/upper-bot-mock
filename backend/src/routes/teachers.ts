import express from 'express';
import { supabase } from '../supabase';

const router = express.Router();

// Create a new exam
router.post('/exams', async (req, res) => {
    const { title, description, group_id, duration_minutes } = req.body;
    const teacherId = req.headers['x-user-id'];

    try {
        const { data, error } = await supabase
            .from('exams')
            .insert({
                title,
                description,
                teacher_id: teacherId,
                group_id,
                duration_minutes
            })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get teacher's groups with stats
router.get('/groups', async (req, res) => {
    const teacherId = req.headers['x-user-id'];

    try {
        const { data: groups, error } = await supabase
            .from('groups')
            .select('*')
            .eq('teacher_id', teacherId);

        if (error) throw error;

        // Calculate stats for each group
        const groupsWithStats = await Promise.all(groups.map(async (group: any) => {
            // Get student count
            const { count } = await supabase
                .from('group_members')
                .select('*', { count: 'exact', head: true })
                .eq('group_id', group.id);

            // Get next class from schedule
            let nextClass = 'No classes scheduled';
            if (group.schedule && Array.isArray(group.schedule)) {
                const daysMap: { [key: string]: number } = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
                const today = new Date();
                const currentDay = today.getDay();

                // Find the next class day
                const upcomingClasses = group.schedule.map((s: any) => {
                    const dayIndex = daysMap[s.day];
                    let diff = dayIndex - currentDay;
                    if (diff < 0) diff += 7; // Next week
                    if (diff === 0) {
                        // Check time if it's today
                        const [hours, minutes] = s.time.split(':').map(Number);
                        const classTime = new Date();
                        classTime.setHours(hours, minutes, 0, 0);
                        if (classTime < today) diff += 7; // Next week if time passed
                    }
                    return { ...s, diff };
                }).sort((a: any, b: any) => a.diff - b.diff);

                if (upcomingClasses.length > 0) {
                    const next = upcomingClasses[0];
                    nextClass = `${next.day}, ${next.time}`;
                }
            }

            return {
                ...group,
                student_count: count || 0,
                next_class: nextClass
            };
        }));

        res.json(groupsWithStats);
    } catch (error) {
        console.error('Error fetching teacher groups:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get teacher's schedule
router.get('/schedule', async (req, res) => {
    const teacherId = req.headers['x-user-id'];

    try {
        // 1. Get all groups for this teacher
        const { data: groups, error } = await supabase
            .from('groups')
            .select('id, name, schedule')
            .eq('teacher_id', teacherId);

        if (error) throw error;

        // 2. Generate schedule for the next 30 days based on group schedules
        const schedule: any[] = [];
        const daysMap: { [key: string]: number } = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };

        const today = new Date();

        // Loop through next 30 days
        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const currentDayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

            groups.forEach((group: any) => {
                if (group.schedule && Array.isArray(group.schedule)) {
                    group.schedule.forEach((s: any) => {
                        if (s.day === currentDayName) {
                            schedule.push({
                                id: `${group.id}-${currentDate.toISOString()}`,
                                title: group.name, // Or a specific topic if we had a lesson plan table
                                group: group.name,
                                time: s.time,
                                location: 'Room 101', // Placeholder, could be in group settings
                                date: currentDate.toISOString()
                            });
                        }
                    });
                }
            });
        }

        // Sort by date and time
        schedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        res.json(schedule);
    } catch (error) {
        console.error('Error fetching teacher schedule:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get teacher's payments
router.get('/payments', async (req, res) => {
    const telegramId = req.headers['x-user-id'];

    try {
        // Get user UUID from Telegram ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('telegram_id', telegramId)
            .single();

        if (userError || !user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const { data, error } = await supabase
            .from('teacher_payments')
            .select('*')
            .eq('teacher_id', user.id)
            .order('payment_date', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching teacher payments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
