import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Middleware to check auth (simplified for now, assumes x-user-id header)
const getUserId = (req: any) => req.headers['x-user-id'] as string;

// ==========================================
// TEACHER ROUTES
// ==========================================

// Get exams created by the teacher
router.get('/teacher/list', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const { data, error } = await supabase
            .from('exams')
            .select('*, questions(count), exam_assignments(count)')
            .eq('teacher_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// Create or Update Exam
router.post('/teacher/save', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id, title, description, duration_minutes, type, location, questions, groups, scheduled_date } = req.body;

    try {
        // 1. Upsert Exam
        const examData = {
            title,
            description,
            duration_minutes,
            type,
            location: type === 'offline' ? location : null,
            teacher_id: userId,
            is_published: true // Auto-publish for now
        };

        let examId = id;

        if (!id) {
            const { data, error } = await supabase
                .from('exams')
                .insert([examData])
                .select()
                .single();
            if (error) throw error;
            examId = data.id;
        } else {
            const { error } = await supabase
                .from('exams')
                .update(examData)
                .eq('id', id);
            if (error) throw error;
        }

        // 2. Handle Questions (Online only)
        if (type === 'online' && questions?.length > 0) {
            // Delete existing questions if updating (simple replacement strategy)
            if (id) {
                await supabase.from('questions').delete().eq('exam_id', examId);
            }

            const questionsToSave = questions.map((q: any, index: number) => ({
                exam_id: examId,
                text: q.text,
                type: q.type,
                options: q.options,
                correct_answer: q.correct_answer,
                points: q.points || 1,
                media_url: q.media_url,
                media_type: q.media_type,
                order_index: index
            }));

            const { error: qError } = await supabase.from('questions').insert(questionsToSave);
            if (qError) throw qError;
        }

        // 3. Handle Assignments
        if (groups?.length > 0 && scheduled_date) {
            // Clear existing assignments for these groups to avoid duplicates? 
            // For now, we'll just insert new ones. In prod, might want to check existing.

            const assignments = groups.map((groupId: string) => ({
                exam_id: examId,
                group_id: groupId,
                scheduled_date: scheduled_date,
                status: 'scheduled'
            }));

            const { error: assignError } = await supabase.from('exam_assignments').insert(assignments);
            if (assignError) console.error('Assignment error:', assignError);
        }

        res.json({ success: true, examId });
    } catch (error) {
        console.error('Save exam error:', error);
        res.status(500).json({ error: 'Failed to save exam' });
    }
});

// ==========================================
// STUDENT ROUTES
// ==========================================

// Get exams assigned to the student
router.get('/student/list', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // 1. Get student's groups
        const { data: groupMembers, error: gmError } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', userId);

        if (gmError) throw gmError;
        const groupIds = groupMembers.map(gm => gm.group_id);

        if (groupIds.length === 0) return res.json([]);

        // 2. Get assignments for these groups
        const { data: assignments, error: assignError } = await supabase
            .from('exam_assignments')
            .select(`
                id,
                scheduled_date,
                status,
                exam:exams (
                    id,
                    title,
                    description,
                    duration_minutes,
                    type,
                    location,
                    questions (count)
                )
            `)
            .in('group_id', groupIds)
            .order('scheduled_date', { ascending: true });

        if (assignError) throw assignError;

        // 3. Check for existing submissions to determine status
        const { data: submissions } = await supabase
            .from('exam_submissions')
            .select('exam_id, status, score')
            .eq('student_id', userId);

        const examsWithStatus = assignments.map((assignment: any) => {
            const submission = submissions?.find(s => s.exam_id === assignment.exam.id);
            return {
                ...assignment.exam,
                scheduled_date: assignment.scheduled_date,
                assignment_id: assignment.id,
                student_status: submission ? submission.status : 'pending',
                score: submission?.score
            };
        });

        res.json(examsWithStatus);
    } catch (error) {
        console.error('Fetch student exams error:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// Get full exam details for taking (Student)
router.get('/:id/take', async (req, res) => {
    const userId = getUserId(req);
    const { id } = req.params;

    try {
        // Verify access (omitted for brevity, but should check if assigned)

        const { data, error } = await supabase
            .from('exams')
            .select('*, questions(*)')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Hide correct answers!
        const sanitizedQuestions = data.questions.map((q: any) => {
            const { correct_answer, ...rest } = q;
            return rest;
        });

        res.json({ ...data, questions: sanitizedQuestions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load exam' });
    }
});

// Submit Exam
router.post('/:id/submit', async (req, res) => {
    const userId = getUserId(req);
    const { id } = req.params;
    const { answers } = req.body; // { question_id: "answer" }

    try {
        // 1. Fetch original questions to grade
        const { data: exam, error } = await supabase
            .from('exams')
            .select('questions(*)')
            .eq('id', id)
            .single();

        if (error) throw error;

        let score = 0;
        let totalPoints = 0;

        exam.questions.forEach((q: any) => {
            totalPoints += q.points || 1;
            if (q.type === 'multiple_choice' || q.type === 'boolean') {
                if (answers[q.id] === q.correct_answer) {
                    score += q.points || 1;
                }
            }
            // Text answers need manual grading or AI grading (skip for now)
        });

        const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

        // 2. Save Submission
        const { error: subError } = await supabase
            .from('exam_submissions')
            .insert([{
                exam_id: id,
                student_id: userId,
                answers,
                score: percentage,
                status: 'submitted',
                submitted_at: new Date().toISOString()
            }]);

        if (subError) throw subError;

        res.json({ success: true, score: percentage });
    } catch (error) {
        console.error('Submit exam error:', error);
        res.status(500).json({ error: 'Failed to submit exam' });
    }
});

export default router;
