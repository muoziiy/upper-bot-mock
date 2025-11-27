import express from 'express';
import { supabase } from '../supabase';

const router = express.Router();

// Get all users
router.get('/users', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Assign role to user
router.post('/users/:userId/role', async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    try {
        const { data, error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add new subject
router.post('/subjects', async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Subject name is required' });
    }

    try {
        const { data, error } = await supabase
            .from('subjects')
            .insert({ name })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error adding subject:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get admin requests (for Super Admin dashboard)
router.get('/requests', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('admin_requests')
            .select('*, users(first_name, last_name, username, telegram_id)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching admin requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get pending student/staff requests (for Admin panel)
router.get('/pending-requests', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, first_name, surname, age, sex, role, created_at')
            .in('role', ['guest', 'waiting_staff'])
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Approve student/staff request
router.post('/approve-request', async (req, res) => {
    const { userId, type } = req.body; // type: 'student' or 'staff'

    if (!userId || !type) {
        return res.status(400).json({ error: 'Missing userId or type' });
    }

    try {
        const newRole = type === 'student' ? 'student' : 'teacher';

        const { error } = await supabase
            .from('users')
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw error;

        res.json({ success: true, message: 'Request approved' });
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Decline student/staff request
router.post('/decline-request', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        // Set role back to new_user
        const { error } = await supabase
            .from('users')
            .update({ role: 'new_user', updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw error;

        res.json({ success: true, message: 'Request declined' });
    } catch (error) {
        console.error('Error declining request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- STATS ENDPOINTS ---

// General Stats
router.get('/stats/general', async (req, res) => {
    try {
        // 1. Total Students
        const { count: totalStudents, error: studentError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student');

        if (studentError) throw studentError;

        // 2. Total Teachers
        const { count: totalTeachers, error: teacherError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'teacher');

        if (teacherError) throw teacherError;

        // 3. Active Groups
        const { count: activeGroups, error: groupError } = await supabase
            .from('groups')
            .select('*', { count: 'exact', head: true }); // Assuming all groups are active for now

        if (groupError) throw groupError;

        // 4. Total Subjects
        const { count: totalSubjects, error: subjectError } = await supabase
            .from('subjects')
            .select('*', { count: 'exact', head: true });

        if (subjectError) throw subjectError;

        // 5. New Students (This Month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: newStudents, error: newStudentError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student')
            .gte('created_at', startOfMonth.toISOString());

        if (newStudentError) throw newStudentError;

        // 6. New Groups (This Month)
        const { count: newGroups, error: newGroupError } = await supabase
            .from('groups')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfMonth.toISOString());

        if (newGroupError) throw newGroupError;

        res.json({
            totalStudents: totalStudents || 0,
            totalTeachers: totalTeachers || 0,
            activeGroups: activeGroups || 0,
            totalSubjects: totalSubjects || 0,
            newStudents: newStudents || 0,
            newGroups: newGroups || 0
        });

    } catch (error) {
        console.error('Error fetching general stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Financial Stats
router.get('/stats/financial', async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // 1. Total Revenue (This Month) - Completed payments
        const { data: revenueData, error: revenueError } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'completed')
            .gte('transaction_date', startOfMonth.toISOString());

        if (revenueError) throw revenueError;

        const totalRevenue = revenueData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // 2. Pending Payments
        const { data: pendingData, error: pendingError } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'pending');

        if (pendingError) throw pendingError;

        const pendingPayments = pendingData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // 3. Recent Transactions (Limit 5)
        const { data: recentTransactions, error: transactionsError } = await supabase
            .from('payments')
            .select('*, users(first_name, surname)')
            .order('transaction_date', { ascending: false })
            .limit(5);

        if (transactionsError) throw transactionsError;

        res.json({
            totalRevenue,
            pendingPayments,
            recentTransactions: recentTransactions || []
        });

    } catch (error) {
        console.error('Error fetching financial stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Students List (with Search)
router.get('/students', async (req, res) => {
    const { search } = req.query;

    try {
        let query = supabase
            .from('users')
            .select(`
                id,
                student_id,
                first_name,
                surname,
                age,
                sex,
                group_members (
                    groups (
                        name
                    )
                )
            `)
            .eq('role', 'student')
            .order('created_at', { ascending: false });

        if (search) {
            const searchStr = String(search);
            // Search by name, surname, or student_id
            query = query.or(`first_name.ilike.%${searchStr}%,surname.ilike.%${searchStr}%,student_id.ilike.%${searchStr}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform data to flatten groups
        const students = data.map((student: any) => ({
            ...student,
            groups: student.group_members?.map((gm: any) => gm.groups?.name).filter(Boolean) || []
        }));

        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
