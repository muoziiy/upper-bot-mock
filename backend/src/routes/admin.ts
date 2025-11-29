import express from 'express';
import { supabase } from '../supabase';
import {
    sendStudentPaymentNotification,
    sendStudentGroupNotification,
    sendStudentInfoNotification,
    sendTeacherPayoutNotification,
    sendTeacherGroupNotification,
    sendTeacherSubjectNotification,
    sendBroadcastNotification
} from '../services/notifications';
import { checkStudentStatus } from '../utils/paymentLogic';

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
            ...(recentIncoming || []).map((t: any) => {
                const userObj = Array.isArray(t.users) ? t.users[0] : t.users;
                return {
                    id: t.id,
                    type: 'incoming',
                    amount: t.amount,
                    date: t.payment_date,
                    status: t.status,
                    user: userObj ? `${userObj.first_name} ${userObj.surname}` : 'Unknown',
                    description: 'Student Payment'
                };
            }),
            ...recentOutgoing.map((t: any) => {
                const userObj = Array.isArray(t.users) ? t.users[0] : t.users;
                return {
                    id: t.id,
                    type: 'outgoing',
                    amount: t.amount,
                    date: t.payment_date,
                    status: t.status,
                    user: userObj ? `${userObj.first_name} ${userObj.surname}` : 'Unknown',
                    description: 'Teacher Payout'
                };
            })
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
                    anchor_day,
                    lessons_remaining,
                    next_due_date,
                    last_payment_date,
                    groups (
                        id,
                        name,
                        price,
                        payment_type,
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

        // 2. Calculate status for each student using JS logic
        const students = studentsData.map((student: any) => {
            let overallStatus = 'unpaid'; // Default
            let hasOverdue = false;
            let hasPaid = false;

            const groups = student.group_members?.map((gm: any) => {
                const group = gm.groups;
                const teacher = group.teacher;

                // Calculate status for this group
                const status = checkStudentStatus({
                    joined_at: gm.joined_at,
                    anchor_day: gm.anchor_day,
                    lessons_remaining: gm.lessons_remaining,
                    next_due_date: gm.next_due_date,
                    last_payment_date: gm.last_payment_date
                }, {
                    payment_type: group.payment_type,
                    price: group.price
                });

                if (status === 'overdue') hasOverdue = true;
                if (status === 'active') hasPaid = true;

                return {
                    id: group.id,
                    name: group.name,
                    price: group.price,
                    payment_type: group.payment_type,
                    teacher_name: teacher ? `${teacher.first_name} ${teacher.surname}` : null,
                    joined_at: gm.joined_at,
                    lessons_remaining: gm.lessons_remaining,
                    next_due_date: gm.next_due_date,
                    status: status
                };
            }).filter((g: any) => g.name) || [];

            if (hasOverdue) overallStatus = 'overdue';
            else if (hasPaid) overallStatus = 'paid';

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
                payment_status: overallStatus,
                amount_due: 0 // We can calculate this if needed, but for now 0
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
    const { name, teacher_id, price, schedule, payment_type } = req.body;

    try {
        const { data, error } = await supabase
            .from('groups')
            .insert({
                name,
                teacher_id: teacher_id || null,
                price: price || 0,
                schedule: schedule || {},
                payment_type: payment_type || 'monthly_fixed'
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
    const { name, teacher_id, price, schedule, payment_type } = req.body;

    try {
        const { data, error } = await supabase
            .from('groups')
            .update({
                name,
                teacher_id: teacher_id || null,
                price: price || 0,
                schedule: schedule || {},
                payment_type: payment_type,
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
    const { groupId, action, anchor_day, lessons_remaining } = req.body; // action: 'add' | 'remove'

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
                        joined_at: req.body.joinedAt || new Date().toISOString(),
                        anchor_day: anchor_day || new Date().getDate(),
                        lessons_remaining: lessons_remaining || 0
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

// Mark Attendance
router.post('/attendance', async (req, res) => {
    const { student_id, group_id, date, status } = req.body;

    if (!student_id || !group_id || !date || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Record Attendance
        const { error: attendanceError } = await supabase
            .from('attendance')
            .insert({
                student_id,
                group_id,
                date,
                status
            });

        if (attendanceError) throw attendanceError;

        // 2. Check Payment Type and Deduct Credits if needed
        if (status === 'present') {
            const { data: groupMember, error: gmError } = await supabase
                .from('group_members')
                .select(`
                    lessons_remaining,
                    groups (payment_type)
                `)
                .eq('student_id', student_id)
                .eq('group_id', group_id)
                .single();

            if (gmError) throw gmError;

            // Type cast to handle nested object from join
            const group = groupMember.groups as any;
            if (group?.payment_type === 'lesson_based') {
                const newCredits = (groupMember.lessons_remaining || 0) - 1;

                // Update credits
                await supabase
                    .from('group_members')
                    .update({ lessons_remaining: newCredits })
                    .eq('student_id', student_id)
                    .eq('group_id', group_id);

                // Check for Low Balance
                if (newCredits <= 2) {
                    const { data: student } = await supabase
                        .from('users')
                        .select('telegram_id')
                        .eq('id', student_id)
                        .single();

                    if (student?.telegram_id) {
                        // Send a simple notification about low balance
                        try {
                            await sendBroadcastNotification([student.telegram_id],
                                `⚠️ *Low Balance Warning*\n\nYou have ${newCredits} credits left for this group. Please top up soon.`
                            );
                        } catch (notifError) {
                            console.error('Failed to send low balance notification:', notifError);
                        }
                    }
                }
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==============================================================================
// BROADCASTING
// ==============================================================================

// Send Broadcast
router.post('/broadcast', async (req, res) => {
    const { message, target_type, target_id, sender_id } = req.body;

    if (!message || !target_type) {
        return res.status(400).json({ error: 'Message and target_type are required' });
    }

    try {
        let recipients: any[] = [];

        // 1. Fetch Recipients
        if (target_type === 'all_students') {
            const { data } = await supabase.from('users').select('telegram_id').eq('role', 'student');
            recipients = data || [];
        } else if (target_type === 'all_teachers') {
            const { data } = await supabase.from('users').select('telegram_id').eq('role', 'teacher');
            recipients = data || [];
        } else if (target_type === 'all_admins') {
            const { data } = await supabase.from('users').select('telegram_id').eq('role', 'admin');
            recipients = data || [];
        } else if (target_type === 'group' && target_id) {
            const { data } = await supabase
                .from('group_members')
                .select('users(telegram_id)')
                .eq('group_id', target_id);
            recipients = data?.map((d: any) => d.users) || [];
        } else if (target_type === 'subject' && target_id) {
            // This is trickier, need to find students in groups with this subject? 
            // Or users with this subject assigned? Let's assume users with subject assigned for now.
            // But subjects are array in users table... 
            // Alternative: Find groups with this subject (if groups have subjects?)
            // Groups don't have subject_id directly in the schema shown, but let's assume we use the user's subject list.
            // For now, let's skip subject broadcasting or implement a simple version if possible.
            // Let's stick to the ones we can easily query.
            // If we want to broadcast to students studying a subject, we need to look at their groups -> teacher -> subject? 
            // Or just broadcast to everyone for now if subject logic is complex.
            // Let's implement 'group' and 'all' first reliably.
            recipients = [];
        }

        // 2. Send Messages
        let successCount = 0;
        const telegramIds = recipients
            .map(r => r.telegram_id)
            .filter(id => id); // Filter out null/undefined

        if (telegramIds.length > 0) {
            const broadcastMessage = `${message}\n\n📢 *Broadcast Message*`;
            const result = await sendBroadcastNotification(telegramIds, broadcastMessage);
            successCount = result.success;
        }

        // 3. Log History
        // 3. Log History
        let userUuid = null;
        if (sender_id) {
            const { data: userData } = await supabase
                .from('users')
                .select('id')
                .eq('telegram_id', sender_id)
                .single();
            if (userData) userUuid = userData.id;
        }

        const { error: logError } = await supabase
            .from('broadcast_history')
            .insert({
                sender_id: userUuid,
                message,
                target_type,
                target_id: target_id || null,
                recipient_count: successCount
            });

        if (logError) throw logError;

        res.json({ success: true, count: successCount });

    } catch (error) {
        console.error('Error sending broadcast:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Broadcast History
router.get('/broadcast/history', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('broadcast_history')
            .select(`
                *,
                sender:users!broadcast_history_sender_id_fkey(first_name, surname)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching broadcast history:', error);
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
            groups_count: 0 // Placeholder - can be calculated with join if needed
        }));

        res.json(teachers);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
