"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../supabase");
const router = express_1.default.Router();
// Create a new exam
router.post('/exams', async (req, res) => {
    const { title, description, group_id, duration_minutes } = req.body;
    const teacherId = req.headers['x-user-id'];
    try {
        const { data, error } = await supabase_1.supabase
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
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get teacher's groups
router.get('/groups', async (req, res) => {
    const teacherId = req.headers['x-user-id'];
    try {
        const { data, error } = await supabase_1.supabase
            .from('groups')
            .select('*')
            .eq('teacher_id', teacherId);
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
