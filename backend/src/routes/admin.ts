import express from 'express';
import { supabase } from '../supabase';
import {
    sendStudentPaymentNotification,
    sendStudentGroupNotification,
    sendStudentInfoNotification,
    sendTeacherPayoutNotification,
    sendTeacherGroupNotification,
    sendTeacherSubjectNotification
} from '../services/notifications';

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

        // 1. Total Revenue (Incoming from Students) - Completed payments
        const { data: revenueData, error: revenueError } = await supabase
            .from('payment_records')
            .select('amount')
            .eq('status', 'completed');

        if (revenueError) throw revenueError;
        const totalRevenue = revenueData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;

        // 2. Pending Payments (Incoming)
        const { data: pendingData, error: pendingError } = await supabase
            .from('payment_records')
            .select('amount')
            .eq('status', 'pending');

        if (pendingError) throw pendingError;
        const pendingPayments = pendingData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;

        // 3. Total Outgoing (Teacher Payments)
        let totalOutgoing = 0;
        try {
            const { data: outgoingData, error: outgoingError } = await supabase
                .from('teacher_payments')
                .select('amount');

            if (!outgoingError && outgoingData) {
                totalOutgoing = outgoingData.reduce((sum, record) => sum + Number(record.amount), 0);
            }
        } catch (e) {
            console.warn('teacher_payments table might not exist yet');
        }

        // 4. Recent Transactions (Merged)
        // Fetch last 5 incoming
        const { data: recentIncoming, error: incomingError } = await supabase
            .from('payment_records')
            .select(`
                id,
                amount,
                payment_date,
                status,
                users (first_name, surname)
            `)
            .order('payment_date', { ascending: false })
            .limit(5);

        if (incomingError) throw incomingError;

        // Fetch last 5 outgoing
        let recentOutgoing: any[] = [];
        try {
            const { data: outgoing, error: outError } = await supabase
                .from('teacher_payments')
                .select(`
                    id,
                    amount,
                    payment_date,
                    status,
                    users (first_name, surname)
                `)
                .order('payment_date', { ascending: false })
                .limit(5);

            if (!outError && outgoing) {
                recentOutgoing = outgoing;
            }
        } catch (e) {
            // Ignore
        }

        // Merge and sort
        const recentTransactions = [
            ...(recentIncoming || []).map(t => ({
                id: t.id,
                type: 'incoming',
                amount: t.amount,
                date: t.payment_date,
                status: t.status,
                user: t.users ? `${t.users.first_name} ${t.users.surname}` : 'Unknown',
                description: 'Student Payment'
            })),
            ...recentOutgoing.map(t => ({
                id: t.id,
                type: 'outgoing',
                amount: t.amount,
                date: t.payment_date,
                status: t.status,
                user: t.users ? `${t.users.first_name} ${t.users.surname}` : 'Unknown',
                description: 'Teacher Payout'
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);

        res.json({
            totalRevenue,
            pendingPayments,
            totalOutgoing,
            netIncome: totalRevenue - totalOutgoing,
            recentTransactions
        });

    } catch (error) {
        console.error('Error fetching financial stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all students with payment status
router.get('/students', async (req, res) => {
    const { search } = req.query;

    try {
        // 1. Fetch base student data with payment_day
        let query = supabase
            .from('users')
            .select(`
                id,
                student_id,
                telegram_id,
                first_name,
                surname,
                age,
                sex,
                payment_day,
                group_members (
                    group_id,
                    joined_at,
                    groups (
                        id,
                        name,
                        price,
                        teacher:users!groups_teacher_id_fkey (
                            first_name,
                            surname
                        )
                    )
                )
            `)
            .eq('role', 'student')
            .order('created_at', { ascending: false });

        if (search) {
            const searchStr = String(search);
            query = query.or(`first_name.ilike.%${searchStr}%,surname.ilike.%${searchStr}%,student_id.ilike.%${searchStr}%`);
        }

        const { data: studentsData, error: studentsError } = await query;
        if (studentsError) throw studentsError;

        // 2. Fetch overdue status for ALL students using new RPC
        const { data: overdueData, error: overdueError } = await supabase
            .rpc('get_overdue_students', { target_date: new Date().toISOString() });

        if (overdueError) {
            console.error('Error fetching overdue status:', overdueError);
        }

        // 2b. Fetch completed payments for current month
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const { data: paidData } = await supabase
            .from('payment_records')
            .select('student_id')
            .eq('status', 'completed')
            .eq('month', currentMonth)
            .eq('year', currentYear);

        const paidSet = new Set(paidData?.map((p: any) => p.student_id));

        // Create a map for quick lookup: student_id -> overdue_info
        const overdueMap = new Map<string, any>();
        if (overdueData) {
            overdueData.forEach((item: any) => {
                overdueMap.set(item.student_id, item);
            });
        }

        // 3. Merge data
        const students = studentsData.map((student: any) => {
            const overdueInfo = overdueMap.get(student.id);
            const isOverdue = !!overdueInfo;
            const isPaid = paidSet.has(student.id);

            let status = 'unpaid';
            if (isOverdue) status = 'overdue';
            else if (isPaid) status = 'paid';

            const groups = student.group_members?.map((gm: any) => {
                const group = gm.groups;
                const teacher = group.teacher;
                return {
                    id: group.id,
                    name: group.name,
                    price: group.price,
                    teacher_name: teacher ? `${teacher.first_name} ${teacher.surname}` : null,
                    joined_at: gm.joined_at
                };
            }).filter((g: any) => g.name) || [];

            return {
                id: student.id,
                student_id: student.student_id,
                telegram_id: student.telegram_id,
                first_name: student.first_name,
                surname: student.surname,
                age: student.age,
                sex: student.sex,
                payment_day: student.payment_day || 1,
                groups: groups,
                payment_status: status,
                amount_due: overdueInfo?.total_amount_due || 0
            };
        });

        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single student details
router.get('/students/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Fetch student basic info
        const { data: student, error: studentError } = await supabase
            .from('users')
            .select(`
                id,
                student_id,
                telegram_id,
                first_name,
                surname,
                age,
                sex,
                payment_day,
                created_at
            `)
            .eq('id', id)
            .single();

        if (studentError) throw studentError;

        // 2. Fetch groups
        const { data: groupsData, error: groupsError } = await supabase
            .from('group_members')
            .select(`
                joined_at,
                groups (
                    id,
                    name,
                    price,
                    teacher:users!groups_teacher_id_fkey (
                        first_name,
                        surname
                    )
                )
            `)
            .eq('student_id', id);

        if (groupsError) throw groupsError;

        // 3. Fetch overdue status
        const { data: overdueData } = await supabase
            .rpc('get_overdue_students', { target_date: new Date().toISOString() });

        const overdueInfo = overdueData?.find((d: any) => d.student_id === id);

        // 4. Check if paid this month
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const { data: paidData } = await supabase
            .from('payment_records')
            .select('id')
            .eq('student_id', id)
            .eq('status', 'completed')
            .eq('month', currentMonth)
            .eq('year', currentYear)
            .limit(1);

        const isPaid = paidData && paidData.length > 0;
        const isOverdue = !!overdueInfo;

        let status = 'unpaid';
        if (isOverdue) status = 'overdue';
        else if (isPaid) status = 'paid';

        // Format groups
        const groups = groupsData.map((gm: any) => ({
            id: gm.groups.id,
            name: gm.groups.name,
            price: gm.groups.price,
            teacher_name: gm.groups.teacher ? `${gm.groups.teacher.first_name} ${gm.groups.teacher.surname}` : null,
            joined_at: gm.joined_at
        }));

        res.json({
            ...student,
            groups,
            payment_status: status,
            amount_due: overdueInfo?.total_amount_due || 0
        });

    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Student Payment Day
router.put('/students/:id/payment-day', async (req, res) => {
    const { id } = req.params;
    const { payment_day } = req.body;

    if (!payment_day || payment_day < 1 || payment_day > 31) {
        return res.status(400).json({ error: 'Invalid payment day' });
    }

    try {
        const { error } = await supabase
            .from('users')
            .update({ payment_day })
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating payment day:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==============================================================================
// STUDENT PAYMENT MANAGEMENT ENDPOINTS
// ==============================================================================

// Get all payments for a specific student
router.get('/students/:id/payments', async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('payment_records')
            .select(`
                *,
                subjects (name)
            `)
            .eq('student_id', id)
            .order('payment_date', { ascending: false });

        if (error) throw error;

        // Transform to include subject name
        const payments = data.map((payment: any) => ({
            ...payment,
            subject_name: payment.subjects?.name
        }));

        res.json(payments);
    } catch (error) {
        console.error('Error fetching student payments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add new payment record (with notification)
router.post('/students/:id/payments', async (req, res) => {
    const { id } = req.params;
    const { subject_id, amount, payment_date, payment_method, status, month, year, notes } = req.body;

    try {
        // Insert payment
        const { data: payment, error: paymentError } = await supabase
            .from('payment_records')
            .insert({
                student_id: id,
                subject_id,
                amount,
                payment_date,
                payment_method,
                status,
                month,
                year,
                notes
            })
            .select(`*, subjects(name)`)
            .single();

        if (paymentError) throw paymentError;

        // Get student's telegram_id for notification
        const { data: student, error: studentError } = await supabase
            .from('users')
            .select('telegram_id')
            .eq('id', id)
            .single();

        if (studentError) throw studentError;

        // Send notification to student
        try {
            await sendStudentPaymentNotification(student.telegram_id, {
                action: 'added',
                subject: payment.subjects?.name || 'Unknown',
                amount: parseFloat(amount),
                date: payment_date,
                method: payment_method,
                status
            });
        } catch (notifError) {
            console.error('Failed to send payment notification:', notifError);
        }

        res.json(payment);
    } catch (error) {
        console.error('Error adding payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update payment record (with notification)
router.put('/students/:id/payments/:paymentId', async (req, res) => {
    const { id, paymentId } = req.params;
    const { subject_id, amount, payment_date, payment_method, status, month, year, notes } = req.body;

    try {
        // Update payment
        const { data: payment, error: paymentError } = await supabase
            .from('payment_records')
            .update({
                subject_id,
                amount,
                payment_date,
                payment_method,
                status,
                month,
                year,
                notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', paymentId)
            .eq('student_id', id)
            .select(`*, subjects(name)`)
            .single();

        if (paymentError) throw paymentError;

        // Get student's telegram_id for notification
        const { data: student, error: studentError } = await supabase
            .from('users')
            .select('telegram_id')
            .eq('id', id)
            .single();

        if (studentError) throw studentError;

        // Send notification to student
        try {
            await sendStudentPaymentNotification(student.telegram_id, {
                action: 'updated',
                subject: payment.subjects?.name || 'Unknown',
                amount: parseFloat(amount),
                date: payment_date,
                method: payment_method,
                status
            });
        } catch (notifError) {
            console.error('Failed to send payment notification:', notifError);
        }

        res.json(payment);
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete payment record (with notification)
router.delete('/students/:id/payments/:paymentId', async (req, res) => {
    const { id, paymentId } = req.params;

    try {
        // Get payment details before deleting (for notification)
        const { data: payment, error: fetchError } = await supabase
            .from('payment_records')
            .select(`*, subjects(name)`)
            .eq('id', paymentId)
            .eq('student_id', id)
            .single();

        if (fetchError) throw fetchError;

        // Delete payment
        const { error: deleteError } = await supabase
            .from('payment_records')
            .delete()
            .eq('id', paymentId)
            .eq('student_id', id);

        if (deleteError) throw deleteError;

        // Get student's telegram_id for notification
        const { data: student, error: studentError } = await supabase
            .from('users')
            .select('telegram_id')
            .eq('id', id)
            .single();

        if (studentError) throw studentError;

        // Send notification to student
        try {
            await sendStudentPaymentNotification(student.telegram_id, {
                action: 'deleted',
                subject: payment.subjects?.name || 'Unknown',
                amount: parseFloat(payment.amount),
                date: payment.payment_date,
                method: payment.payment_method,
                status: payment.status
            });
        } catch (notifError) {
            console.error('Failed to send payment notification:', notifError);
        }

        res.json({ success: true, message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==============================================================================
// HELPER ENDPOINTS FOR DROPDOWNS
// ==============================================================================

// Get all subjects (simple list)
router.get('/subjects/list', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subjects')
            .select('id, name')
            .order('name');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all groups (simple list)
router.get('/groups/list', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('groups')
            .select(`
                id, 
                name, 
                price, 
                schedule, 
                teacher_id,
                teacher:users!groups_teacher_id_fkey (
                    first_name,
                    surname
                )
            `)
            .order('name');

        if (error) throw error;

        // Flatten teacher name
        const groups = data.map((g: any) => ({
            ...g,
            teacher_name: g.teacher ? `${g.teacher.first_name} ${g.teacher.surname}` : 'No Teacher'
        }));

        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Group
router.post('/groups', async (req, res) => {
    const { name, teacher_id, price, schedule } = req.body;

    try {
        const { data, error } = await supabase
            .from('groups')
            .insert({
                name,
                teacher_id: teacher_id || null,
                price: price || 0,
                schedule: schedule || {}
            })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Group
router.put('/groups/:id', async (req, res) => {
    const { id } = req.params;
    const { name, teacher_id, price, schedule } = req.body;

    try {
        const { data, error } = await supabase
            .from('groups')
            .update({
                name,
                teacher_id: teacher_id || null,
                price: price || 0,
                schedule: schedule || {},
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete Group
router.delete('/groups/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('groups')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==============================================================================
// STUDENT GROUP MANAGEMENT
// ==============================================================================

// Update student groups (Add/Remove)
router.put('/students/:id/groups', async (req, res) => {
    const { id } = req.params;
    const { groupId, action } = req.body; // action: 'add' | 'remove'

    try {
        if (action === 'add') {
            // Check if already exists
            const { data: existing } = await supabase
                .from('group_members')
                .select('id')
                .eq('student_id', id)
                .eq('group_id', groupId)
                .single();

            if (!existing) {
                const { error } = await supabase
                    .from('group_members')
                    .insert({
                        student_id: id,
                        group_id: groupId,
                        joined_at: req.body.joinedAt || new Date().toISOString()
                    });
                if (error) throw error;
            }
        } else if (action === 'remove') {
            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('student_id', id)
                .eq('group_id', groupId);
            if (error) throw error;
        }

        // Get details for notification
        const { data: group } = await supabase
            .from('groups')
            .select('name')
            .eq('id', groupId)
            .single();

        const { data: student } = await supabase
            .from('users')
            .select('telegram_id')
            .eq('id', id)
            .single();

        if (student && group) {
            try {
                await sendStudentGroupNotification(student.telegram_id, {
                    added: action === 'add' ? [group.name] : [],
                    removed: action === 'remove' ? [group.name] : []
                });
            } catch (e) {
                console.error('Failed to send group notification', e);
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating student groups:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all teachers
router.get('/teachers', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
                id,
                first_name,
                surname,
                subjects
            `)
            .eq('role', 'teacher')
            .order('first_name', { ascending: true });

        if (error) throw error;

        // TODO: Add groups count if needed
        const teachers = data.map(teacher => ({
            ...teacher,
            groups_count: 0 // Placeholder
        }));

        res.json(teachers);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
