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
import bot from '../bot';

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

// Get all students (with search and details)
router.get('/students', async (req, res) => {
    const { search } = req.query;

    try {
        let query = supabase
            .from('users')
            .select(`
                *,
                group_members (
                    payment_status,
                    joined_at,
                    groups (
                        id,
                        name,
                        price,
                        users:users!groups_teacher_id_fkey (first_name, surname)
                    )
                )
                )
            `)
            .eq('role', 'student')
            .order('created_at', { ascending: false });

        if (search) {
            const searchStr = String(search);
            query = query.or(`first_name.ilike.%${searchStr}%,surname.ilike.%${searchStr}%,onboarding_first_name.ilike.%${searchStr}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform data
        const formattedData = data.map((student: any) => {
            const groups = student.group_members?.map((gm: any) => ({
                id: gm.groups?.id,
                name: gm.groups?.name,
                price: gm.groups?.price,
                teacher_name: gm.groups?.users ? `${gm.groups.users.first_name} ${gm.groups.users.surname || ''}`.trim() : undefined,
                joined_at: gm.joined_at,
                payment_status: gm.payment_status
            })).filter((g: any) => g.id); // Filter out null groups if any

            // Determine overall status
            let payment_status = 'paid';
            if (groups.some((g: any) => g.payment_status === 'overdue')) {
                payment_status = 'overdue';
            } else if (groups.some((g: any) => g.payment_status === 'unpaid')) {
                payment_status = 'unpaid';
            }

            return {
                id: student.id,
                student_id: student.student_id || '---',
                first_name: student.first_name,
                onboarding_first_name: student.onboarding_first_name,
                surname: student.surname || '',
                age: student.age,
                sex: student.sex,
                groups,
                payment_status
            };
        });

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all groups list
router.get('/groups/list', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .order('name');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Group Details (with students)
router.get('/groups/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .eq('id', id)
            .single();

        if (groupError) throw groupError;

        // Get students in group
        const { data: members, error: membersError } = await supabase
            .from('group_members')
            .select(`
                student_id,
                users (
                    id,
                    first_name,
                    surname,
                    student_id
                )
            `)
            .eq('group_id', id);

        if (membersError) throw membersError;

        const students = members.map((m: any) => ({
            id: m.users.id,
            first_name: m.users.first_name,
            surname: m.users.surname,
            student_id: m.users.student_id
        }));

        res.json({ ...group, students });
    } catch (error) {
        console.error('Error fetching group details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Student Details
router.get('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                group_members (
                    joined_at,
                    payment_status,
                    groups (
                        id,
                        name,
                        price,
                        teacher_id,
                        users:users!groups_teacher_id_fkey (first_name, surname)
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Format groups
        const groups = data.group_members ? data.group_members.map((gm: any) => ({
            id: gm.groups?.id,
            name: gm.groups?.name,
            price: gm.groups?.price,
            teacher_name: gm.groups?.users ? `${gm.groups.users.first_name} ${gm.groups.users.surname || ''}`.trim() : undefined,
            joined_at: gm.joined_at,
            payment_status: gm.payment_status
        })) : [];

        res.json({ ...data, groups });
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Student Payments
router.get('/students/:id/payments', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('payment_records')
            .select(`
                *,
                groups (name)
            `)
            .eq('student_id', id)
            .order('payment_date', { ascending: false });

        if (error) throw error;

        const formatted = data.map((p: any) => ({
            ...p,
            subject_name: p.groups?.name
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add Student Payment
router.post('/students/:id/payments', async (req, res) => {
    const { id } = req.params;
    const { amount, payment_date, payment_method, group_id, lessons_attended, status, month, year } = req.body;

    try {
        const { data, error } = await supabase
            .from('payment_records')
            .insert([{
                student_id: id,
                amount,
                payment_date,
                payment_method,
                group_id,
                lessons_attended,
                status,
                month,
                year
            }])
            .select()
            .single();

        if (error) throw error;

        // Recalculate status
        if (group_id) {
            await recalculateStudentGroupStatus(id, group_id);
        }

        res.json(data);
    } catch (error) {
        console.error('Error adding payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete Student Payment
router.delete('/students/:id/payments/:paymentId', async (req, res) => {
    const { id, paymentId } = req.params;
    try {
        // Get payment to know group_id for recalculation
        const { data: payment } = await supabase
            .from('payment_records')
            .select('group_id')
            .eq('id', paymentId)
            .single();

        const { error } = await supabase
            .from('payment_records')
            .delete()
            .eq('id', paymentId);

        if (error) throw error;

        if (payment?.group_id) {
            await recalculateStudentGroupStatus(id, payment.group_id);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Manage Student Groups (Add/Remove)
router.put('/students/:id/groups', async (req, res) => {
    const { id } = req.params;
    const { groupId, action, joinedAt } = req.body;

    try {
        if (action === 'add') {
            const { error } = await supabase
                .from('group_members')
                .insert([{
                    student_id: id,
                    group_id: groupId,
                    joined_at: joinedAt || new Date().toISOString()
                }]);
            if (error) throw error;

            // Recalculate status to set initial due date
            await recalculateStudentGroupStatus(id, groupId);

        } else if (action === 'remove') {
            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('student_id', id)
                .eq('group_id', groupId);
            if (error) throw error;
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error managing student groups:', error);
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

// Get pending student/staff requests (for Admin panel)
router.get('/pending-requests', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('registration_requests')
            .select(`
                id,
                status,
                role_requested,
                created_at,
                users (
                    id,
                    first_name,
                    onboarding_first_name,
                    surname,
                    age,
                    sex,
                    username
                )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match frontend expectation
        const formattedData = data.map((req: any) => ({
            id: req.id, // Request ID
            user_id: req.users.id,
            first_name: req.users.first_name,
            onboarding_first_name: req.users.onboarding_first_name,
            surname: req.users.surname,
            age: req.users.age,
            sex: req.users.sex,
            role: req.role_requested === 'teacher' ? 'waiting_staff' : 'guest', // Map back to role for UI
            created_at: req.created_at,
            users: req.users
        }));

        res.json(formattedData);
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
        // 1. Get the pending request
        const { data: request, error: reqError } = await supabase
            .from('registration_requests')
            .select('id, status')
            .eq('user_id', userId)
            .eq('status', 'pending')
            .single();

        if (reqError || !request) {
            return res.status(400).json({ error: 'Request not found or already processed' });
        }

        // 2. Update request status
        const { error: updateReqError } = await supabase
            .from('registration_requests')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', request.id);

        if (updateReqError) throw updateReqError;

        // 3. Update User Role
        const newRole = type === 'student' ? 'student' : 'teacher';
        const { error } = await supabase
            .from('users')
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw error;

        // 4. Mass Update (Sync Magic)
        const { data: logs } = await supabase
            .from('admin_notification_logs')
            .select('admin_chat_id, message_id')
            .eq('request_id', request.id);

        if (logs && logs.length > 0) {
            for (const log of logs) {
                try {
                    await bot.telegram.editMessageText(
                        log.admin_chat_id,
                        Number(log.message_id),
                        undefined,
                        `✅ Request approved.`,
                        { parse_mode: 'Markdown' } // Removes buttons by not including reply_markup
                    );
                } catch (e) {
                    console.error(`Failed to update message for admin ${log.admin_chat_id}`, e);
                }
            }
        }

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
        // 1. Get the pending request
        const { data: request, error: reqError } = await supabase
            .from('registration_requests')
            .select('id, status')
            .eq('user_id', userId)
            .eq('status', 'pending')
            .single();

        if (reqError || !request) {
            return res.status(400).json({ error: 'Request not found or already processed' });
        }

        // 2. Update request status
        const { error: updateReqError } = await supabase
            .from('registration_requests')
            .update({ status: 'declined', updated_at: new Date().toISOString() })
            .eq('id', request.id);

        if (updateReqError) throw updateReqError;

        // 3. Update User Role (Revert to new_user)
        const { error } = await supabase
            .from('users')
            .update({ role: 'new_user', updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw error;

        // 4. Mass Update (Sync Magic)
        const { data: logs } = await supabase
            .from('admin_notification_logs')
            .select('admin_chat_id, message_id')
            .eq('request_id', request.id);

        if (logs && logs.length > 0) {
            for (const log of logs) {
                try {
                    await bot.telegram.editMessageText(
                        log.admin_chat_id,
                        Number(log.message_id),
                        undefined,
                        `❌ Request declined.`,
                        { parse_mode: 'Markdown' }
                    );
                } catch (e) {
                    console.error(`Failed to update message for admin ${log.admin_chat_id}`, e);
                }
            }
        }

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
// Report Problem / Suggestion
router.post('/support/report', async (req, res) => {
    const { user_id, type, message } = req.body;

    try {
        // 1. Get User Info
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('first_name, surname, telegram_id, role')
            .eq('id', user_id)
            .single();

        if (userError) throw userError;

        // 2. Get Admin Info (to send notification to)
        // For now, we'll send to all Super Admins or a specific admin
        // Let's fetch the first super_admin's telegram_id
        const { data: admin, error: adminError } = await supabase
            .from('users')
            .select('telegram_id')
            .eq('role', 'super_admin')
            .limit(1)
            .single();

        if (adminError || !admin?.telegram_id) {
            console.warn('No admin found to receive report');
            // We still save to DB if we had a reports table, but for now just log
        } else {
            // 3. Send Notification
            const icon = type === 'problem' ? '🔴' : '💡';
            const reportMsg = `${icon} *New Support Ticket*\n\n` +
                `From: ${user.first_name} ${user.surname || ''} (${user.role})\n` +
                `Type: ${type === 'problem' ? 'Problem' : 'Suggestion'}\n\n` +
                `Message:\n${message}`;

            await bot.telegram.sendMessage(admin.telegram_id, reportMsg, { parse_mode: 'Markdown' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error sending report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete student from group
router.delete('/students/:id/groups', async (req, res) => {
    const { id } = req.params;
    const { groupId } = req.body;

    try {
        // Get group details for notification before deleting
        const { data: group } = await supabase
            .from('groups')
            .select('name')
            .eq('id', groupId)
            .single();

        const { error } = await supabase
            .from('group_members')
            .delete()
            .eq('student_id', id)
            .eq('group_id', groupId);

        if (error) throw error;

        // Get student's telegram_id for notification
        const { data: student } = await supabase
            .from('users')
            .select('telegram_id')
            .eq('id', id)
            .single();

        if (student && group) {
            try {
                await sendStudentGroupNotification(student.telegram_id, {
                    added: [],
                    removed: [group.name]
                });
            } catch (e) {
                console.error('Failed to send group notification', e);
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing student from group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==============================================================================
// HELPER: RECALCULATE STUDENT GROUP STATUS
// ==============================================================================

async function recalculateStudentGroupStatus(studentId: string, groupId: string) {
    try {
        // 1. Get Group Config & Member Data
        const { data: groupMember, error: gmError } = await supabase
            .from('group_members')
            .select(`
    *,
    groups(
        price,
        payment_type
    )
        `)
            .eq('group_id', groupId)
            .eq('student_id', studentId)
            .single();

        if (gmError || !groupMember) return;

        const paymentType = groupMember.payment_type || groupMember.groups.payment_type;

        // 2. Fetch All Payments for this Group
        const { data: payments } = await supabase
            .from('payment_records')
            .select('*')
            .eq('student_id', studentId)
            .eq('group_id', groupId)
            .eq('status', 'completed'); // Only count completed payments

        const validPayments = payments || [];

        let updates: any = {};

        // --- CALCULATION LOGIC ---

        if (paymentType === 'lesson_based') {
            // A. Lesson Based
            // Total Paid Lessons
            const totalPaidLessons = validPayments.reduce((sum, p) => sum + (p.lessons_attended || 0), 0);

            // Total Used Lessons (Attendance)
            const { count: totalUsedLessons } = await supabase
                .from('attendance_records')
                .select('*', { count: 'exact', head: true })
                .eq('student_id', studentId)
                .eq('group_id', groupId)
                .in('status', ['present', 'late']);

            const lessonsRemaining = totalPaidLessons - (totalUsedLessons || 0);

            updates.lessons_remaining = lessonsRemaining;
            updates.payment_status = lessonsRemaining > 0 ? 'paid' : 'overdue';

        } else {
            // B. Monthly (Fixed or Rolling)
            // Sort payments by date desc
            validPayments.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

            if (validPayments.length > 0) {
                const lastPayment = validPayments[0];
                // If we have month/year, use that.
                if (lastPayment.month && lastPayment.year) {
                    // Next due is the month AFTER the last paid month.
                    const lastPaidDate = new Date(lastPayment.year, lastPayment.month - 1, 1);
                    const nextDue = new Date(lastPaidDate);
                    nextDue.setMonth(nextDue.getMonth() + 1);
                    updates.next_due_date = nextDue.toISOString();
                    updates.last_payment_date = lastPayment.payment_date;
                } else {
                    // Fallback: just add 1 month to payment date
                    const nextDue = new Date(lastPayment.payment_date);
                    nextDue.setMonth(nextDue.getMonth() + 1);
                    updates.next_due_date = nextDue.toISOString();
                    updates.last_payment_date = lastPayment.payment_date;
                }
            } else {
                // No payments? Use joined_at as the first due date
                if (groupMember.joined_at) {
                    updates.next_due_date = groupMember.joined_at;
                } else {
                    // Fallback if no joined_at (shouldn't happen usually)
                    updates.next_due_date = new Date().toISOString();
                }
                updates.payment_status = 'overdue'; // Initially overdue until paid
            }

            // Check Status if we have a due date
            if (updates.next_due_date) {
                const today = new Date();
                const dueDate = new Date(updates.next_due_date);
                // If due date is in the future, it's paid (or pending). If past/today, it's overdue.
                // Actually, if I just joined and haven't paid, I am overdue immediately if prepaid.
                // But if we want to give grace period? For now, strict: overdue if not paid.
                // Logic above sets 'overdue' if no payments.
                // If payments exist, we check:
                if (validPayments.length > 0) {
                    updates.payment_status = dueDate > today ? 'paid' : 'overdue';
                }
            }
        }

        // 3. Update Group Member
        if (Object.keys(updates).length > 0) {
            await supabase
                .from('group_members')
                .update(updates)
                .eq('group_id', groupId)
                .eq('student_id', studentId);
        }

    } catch (e) {
        console.error('Error recalculating status:', e);
    }
};

// ==============================================================================
// TEACHER MANAGEMENT ENDPOINTS
// ==============================================================================

// Get Teacher Details
router.get('/teachers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { data: teacher, error: teacherError } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (teacherError) throw teacherError;

        const { data: groups, error: groupsError } = await supabase
            .from('groups')
            .select('*')
            .eq('teacher_id', id);

        if (groupsError) throw groupsError;

        // Calculate stats for groups
        const groupsWithStats = await Promise.all(groups.map(async (group: any) => {
            const { count } = await supabase
                .from('group_members')
                .select('*', { count: 'exact', head: true })
                .eq('group_id', group.id);

            return {
                ...group,
                student_count: count || 0
            };
        }));

        res.json({
            teacher,
            groups: groupsWithStats
        });
    } catch (error) {
        console.error('Error fetching teacher details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Teacher Details
router.put('/teachers/:id', async (req, res) => {
    const { id } = req.params;
    const { bio, first_name, surname, phone_number } = req.body;

    try {
        const updates: any = {};
        if (bio !== undefined) updates.bio = bio;
        if (first_name !== undefined) updates.first_name = first_name;
        if (surname !== undefined) updates.surname = surname;
        if (phone_number !== undefined) updates.phone_number = phone_number;

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error updating teacher details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Teacher Payments
router.get('/teachers/:id/payments', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('teacher_payments')
            .select('*')
            .eq('teacher_id', id)
            .order('payment_date', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching teacher payments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add Teacher Payment
router.post('/teachers/:id/payments', async (req, res) => {
    const { id } = req.params;
    const { amount, payment_date, description } = req.body;

    try {
        const { data, error } = await supabase
            .from('teacher_payments')
            .insert([{ teacher_id: id, amount, payment_date, description }])
            .select()
            .single();

        if (error) throw error;

        // Notify Teacher
        const { data: teacher } = await supabase
            .from('users')
            .select('telegram_id')
            .eq('id', id)
            .single();

        if (teacher?.telegram_id) {
            try {
                await bot.telegram.sendMessage(
                    teacher.telegram_id,
                    `💰 *New Payout Received*\n\nAmount: ${amount.toLocaleString()} UZS\nDate: ${payment_date}\n${description ? `Note: ${description}` : ''}`,
                    { parse_mode: 'Markdown' }
                );
            } catch (e) {
                console.error('Failed to send notification', e);
            }
        }

        res.json(data);
    } catch (error) {
        console.error('Error adding teacher payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete Teacher Payment
router.delete('/teachers/:id/payments/:paymentId', async (req, res) => {
    const { id, paymentId } = req.params;

    try {
        const { error } = await supabase
            .from('teacher_payments')
            .delete()
            .eq('id', paymentId);

        if (error) throw error;

        // Notify Teacher
        const { data: teacher } = await supabase
            .from('users')
            .select('telegram_id')
            .eq('id', id)
            .single();

        if (teacher?.telegram_id) {
            try {
                await bot.telegram.sendMessage(
                    teacher.telegram_id,
                    `❌ *Payout Cancelled*\n\nA payout record has been removed by admin.`,
                    { parse_mode: 'Markdown' }
                );
            } catch (e) {
                console.error('Failed to send notification', e);
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting teacher payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete Subject
router.delete('/subjects/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Center Settings
router.get('/settings', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('education_center_settings')
            .select('*')
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"

        res.json(data || {});
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bulk update payment settings
router.post('/settings/payment-type', async (req, res) => {
    const { payment_type, broadcast } = req.body;

    try {
        // Update default setting
        const { error: settingsError } = await supabase
            .from('education_center_settings')
            .upsert({ id: 1, default_payment_type: payment_type }, { onConflict: 'id' }); // Assuming singleton row with id 1

        if (settingsError) throw settingsError;

        // Update all active groups
        const { error: groupsError } = await supabase
            .from('groups')
            .update({ payment_type })
            .neq('payment_type', payment_type); // Only update if different

        if (groupsError) throw groupsError;

        // If broadcast requested
        if (broadcast) {
            // ... broadcast logic ...
        }

        res.json({ success: true, message: 'Payment settings updated for all students' });
    } catch (error) {
        console.error('Error updating payment settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Reminders Settings
router.post('/settings/reminders', async (req, res) => {
    const { enable_payment_reminders, enable_class_reminders } = req.body;

    try {
        const { error } = await supabase
            .from('education_center_settings')
            .upsert({
                id: 1,
                enable_payment_reminders,
                enable_class_reminders
            }, { onConflict: 'id' });

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating reminder settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Support Info
router.post('/settings/support', async (req, res) => {
    const { support_info } = req.body;

    if (!support_info || typeof support_info !== 'object') {
        return res.status(400).json({ error: 'Invalid support info' });
    }

    try {
        // Upsert settings (assuming singleton)
        const { error } = await supabase
            .from('education_center_settings')
            .update({ support_info, updated_at: new Date().toISOString() })
            .gt('updated_at', '2000-01-01'); // Dummy condition to match all

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating support info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
