"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../supabase");
const router = express_1.default.Router();
// Get all users
router.get('/users', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('*');
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Assign role to user
router.post('/users/:userId/role', async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    try {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .update({ role })
            .eq('id', userId)
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
// Add new subject
router.post('/subjects', async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Subject name is required' });
    }
    try {
        const { data, error } = await supabase_1.supabase
            .from('subjects')
            .insert({ name })
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('Error adding subject:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get admin requests (for Super Admin dashboard)
router.get('/requests', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('admin_requests')
            .select('*, users(first_name, last_name, username, telegram_id)')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching admin requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get pending student/staff requests (for Admin panel)
router.get('/pending-requests', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('id, first_name, surname, age, sex, role, created_at')
            .in('role', ['guest', 'waiting_staff'])
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
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
        const { error } = await supabase_1.supabase
            .from('users')
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq('id', userId);
        if (error)
            throw error;
        res.json({ success: true, message: 'Request approved' });
    }
    catch (error) {
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
        const { error } = await supabase_1.supabase
            .from('users')
            .update({ role: 'new_user', updated_at: new Date().toISOString() })
            .eq('id', userId);
        if (error)
            throw error;
        res.json({ success: true, message: 'Request declined' });
    }
    catch (error) {
        console.error('Error declining request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
