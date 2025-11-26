-- Onboarding & Guest Mode Migration
-- This script adds new roles, columns, and tables for the onboarding flow.

-- 1. Update user_role enum
-- Note: If this fails due to transaction issues, run these ALTER TYPE commands separately.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'waiting_user';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'waiting_staff';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'guest';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'new_user';

-- 2. Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS surname TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sex TEXT; -- 'male', 'female'
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Tashkent';

-- 3. Create Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Teacher Subjects Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS teacher_subjects (
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_id, subject_id)
);

-- 5. RLS Policies

-- Enable RLS for new tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;

-- Subjects Policies
-- Everyone can view subjects
CREATE POLICY "everyone_view_subjects" ON subjects FOR SELECT USING (true);
-- Only Admins/Super Admins can manage subjects
CREATE POLICY "admins_manage_subjects" ON subjects FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Teacher Subjects Policies
-- Everyone can view
CREATE POLICY "everyone_view_teacher_subjects" ON teacher_subjects FOR SELECT USING (true);
-- Teachers can manage their own subjects
CREATE POLICY "teachers_manage_own_subjects" ON teacher_subjects FOR ALL USING (
    auth.uid() = teacher_id
);
-- Admins can manage all
CREATE POLICY "admins_manage_teacher_subjects" ON teacher_subjects FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 6. Insert Default Subjects (Optional)
INSERT INTO subjects (name) VALUES 
('Mathematics'), ('Physics'), ('English'), ('Chemistry'), ('Biology'), ('History'), ('Geography')
ON CONFLICT (name) DO NOTHING;
