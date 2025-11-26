-- Update Schema for Lessons and Homework

-- 1. Scheduled Lessons Table (Matches user's "lessons" requirements)
CREATE TABLE IF NOT EXISTS scheduled_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    is_online BOOLEAN DEFAULT FALSE,
    location TEXT, -- Room name or Group name/Link if online
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_lessons_group ON scheduled_lessons(group_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_lessons_teacher ON scheduled_lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_lessons_subject ON scheduled_lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_lessons_date ON scheduled_lessons(scheduled_date);

-- 2. Homework Table
CREATE TABLE IF NOT EXISTS homework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT, -- "Homework context"
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES scheduled_lessons(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homework_group ON homework(group_id);
CREATE INDEX IF NOT EXISTS idx_homework_lesson ON homework(lesson_id);

-- 3. RLS Policies for New Tables
ALTER TABLE scheduled_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

-- Scheduled Lessons Policies
CREATE POLICY "students_view_group_lessons" ON scheduled_lessons FOR SELECT USING (
    group_id IN (
        SELECT group_id FROM group_members WHERE student_id = auth.uid()
    )
);
CREATE POLICY "teachers_view_own_lessons" ON scheduled_lessons FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "admins_manage_lessons" ON scheduled_lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Homework Policies
CREATE POLICY "students_view_group_homework" ON homework FOR SELECT USING (
    group_id IN (
        SELECT group_id FROM group_members WHERE student_id = auth.uid()
    )
);
CREATE POLICY "teachers_manage_homework" ON homework FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY "admins_manage_homework" ON homework FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 4. Sample Data Insertion (For testing)
-- Note: This assumes some users and subjects exist. If running on a fresh DB, ensure users/subjects exist first.

-- Insert a sample group if not exists
INSERT INTO groups (id, name) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Group A - English')
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons
INSERT INTO scheduled_lessons (title, description, scheduled_date, subject_id, group_id, is_online, location, status)
SELECT 
    'Introduction to Grammar', 
    'Basics of English Grammar', 
    NOW() + INTERVAL '1 day', 
    id as subject_id, 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' as group_id, 
    FALSE, 
    'Room 101', 
    'pending'
FROM subjects WHERE name = 'English' LIMIT 1;

INSERT INTO scheduled_lessons (title, description, scheduled_date, subject_id, group_id, is_online, location, status)
SELECT 
    'Advanced Speaking', 
    'Conversation practice', 
    NOW() - INTERVAL '1 day', 
    id as subject_id, 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' as group_id, 
    TRUE, 
    'Zoom Link', 
    'completed'
FROM subjects WHERE name = 'English' LIMIT 1;

-- Insert sample homework
INSERT INTO homework (title, description, group_id, lesson_id)
SELECT 
    'Grammar Exercises', 
    'Complete page 10-12', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    id 
FROM scheduled_lessons WHERE title = 'Introduction to Grammar' LIMIT 1;

