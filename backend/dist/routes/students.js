"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../supabase");
const router = express_1.default.Router();
// Get Center Settings (Public/Student)
router.get('/settings', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('education_center_settings')
            .select('support_info')
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get available exams for a student
router.get('/exams', async (req, res) => {
    const studentId = req.headers['x-user-id']; // Mock auth header
    if (!studentId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        // Fetch exams: global (group_id is null) OR assigned to student's groups
        // This logic is complex in simple query, might need RPC or two queries.
        // For now, let's fetch published exams and filter in application or use complex query if possible.
        // Or rely on RLS if we were using Supabase client with auth context, but here we are admin client.
        // Simplified: Get all published exams
        const { data, error } = await supabase_1.supabase
            .from('exams')
            .select('*')
            .eq('is_published', true);
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Submit exam result
router.post('/exams/:examId/submit', async (req, res) => {
    const { examId } = req.params;
    const { answers, score } = req.body;
    const studentId = req.headers['x-user-id'];
    try {
        const { data, error } = await supabase_1.supabase
            .from('exam_results')
            .insert({
            exam_id: examId,
            student_id: studentId,
            answers,
            score,
            submitted_at: new Date().toISOString(),
            is_completed: true
        })
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
