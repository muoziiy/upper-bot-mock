-- ============================================
-- SEED DATA FOR EDUCATION CENTER BOT
-- ============================================
-- Run this script AFTER full_schema.sql to populate the database with dummy data.

-- 1. Create Users (Teachers)
INSERT INTO users (id, telegram_id, first_name, surname, role, username) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 1001, 'John', 'Doe', 'teacher', 'johndoe'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 1002, 'Sarah', 'Smith', 'teacher', 'sarahsmith'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 1003, 'Mike', 'Johnson', 'teacher', 'mikej')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Users (Students)
INSERT INTO users (id, telegram_id, first_name, surname, role, student_id, payment_day) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 2001, 'Alice', 'Brown', 'student', '100001', 1),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 2002, 'Bob', 'Wilson', 'student', '100002', 5),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 2003, 'Charlie', 'Davis', 'student', '100003', 10),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 2004, 'Diana', 'Evans', 'student', '100004', 15),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 2005, 'Evan', 'Foster', 'student', '100005', 1)
ON CONFLICT (id) DO NOTHING;

-- 3. Create Groups
INSERT INTO groups (id, name, teacher_id, price) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'English Elementary', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 500000),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'IELTS Prep', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 800000),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'Math Basics', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 450000)
ON CONFLICT (id) DO NOTHING;

-- 4. Enroll Students in Groups
INSERT INTO group_members (group_id, student_id, created_at) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', NOW() - INTERVAL '2 months'), -- Alice in English
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', NOW() - INTERVAL '2 months'), -- Bob in English
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', NOW() - INTERVAL '1 month'),  -- Charlie in IELTS
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', NOW() - INTERVAL '1 month'),  -- Diana in Math
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', NOW() - INTERVAL '5 days')    -- Evan in English
ON CONFLICT (group_id, student_id) DO NOTHING;

-- 5. Add Payments
-- Alice: Paid for current month
INSERT INTO payment_records (student_id, group_id, amount, payment_date, status, month, year, payment_method) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 500000, CURRENT_DATE, 'completed', EXTRACT(MONTH FROM CURRENT_DATE)::INT, EXTRACT(YEAR FROM CURRENT_DATE)::INT, 'cash');

-- Bob: Unpaid (Overdue if payment day passed)
-- No payment record for current month

-- Charlie: Paid for previous month, unpaid current
INSERT INTO payment_records (student_id, group_id, amount, payment_date, status, month, year, payment_method) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 800000, CURRENT_DATE - INTERVAL '1 month', 'completed', EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')::INT, EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')::INT, 'card');

-- Diana: Pending payment
INSERT INTO payment_records (student_id, group_id, amount, payment_date, status, month, year, payment_method) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 450000, CURRENT_DATE, 'pending', EXTRACT(MONTH FROM CURRENT_DATE)::INT, EXTRACT(YEAR FROM CURRENT_DATE)::INT, 'cash');

-- 6. Add Attendance
INSERT INTO attendance_records (student_id, group_id, attendance_date, status) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', CURRENT_DATE - INTERVAL '1 day', 'present'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', CURRENT_DATE - INTERVAL '1 day', 'absent'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', CURRENT_DATE - INTERVAL '3 days', 'present');
