-- ============================================
-- EDUCATION CENTER BOT - COMPLETE SQL SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('guest', 'student', 'teacher', 'admin');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'text', 'boolean');

-- ============================================
-- TABLES
-- ============================================

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    role user_role DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_role ON users(role);

-- GROUPS TABLE
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_groups_teacher_id ON groups(teacher_id);

-- GROUP MEMBERS TABLE
CREATE TABLE group_members (
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, student_id)
);

CREATE INDEX idx_group_members_student_id ON group_members(student_id);

-- EXAMS TABLE
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL, -- NULL = global exam
    is_published BOOLEAN DEFAULT FALSE,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exams_teacher_id ON exams(teacher_id);
CREATE INDEX idx_exams_group_id ON exams(group_id);
CREATE INDEX idx_exams_published ON exams(is_published);

-- QUESTIONS TABLE
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type question_type DEFAULT 'multiple_choice',
    options JSONB, -- [{"id": "A", "text": "Option A"}, ...]
    correct_answer JSONB, -- {"answer": "A"} or {"answer": "true"}
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_questions_exam_id ON questions(exam_id);

-- EXAM RESULTS TABLE
CREATE TABLE exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    answers JSONB, -- [{"question_id": "uuid", "answer": "A"}, ...]
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT FALSE,
    UNIQUE(exam_id, student_id) -- One attempt per exam
);

CREATE INDEX idx_exam_results_student_id ON exam_results(student_id);
CREATE INDEX idx_exam_results_exam_id ON exam_results(exam_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Admins can do everything
CREATE POLICY "admin_all_users" ON users
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Users can read their own data
CREATE POLICY "users_read_own" ON users
    FOR SELECT 
    USING (id = auth.uid());

-- Users can update their own data (except role)
CREATE POLICY "users_update_own" ON users
    FOR UPDATE 
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND role = (SELECT role FROM users WHERE id = auth.uid()));

-- ============================================
-- GROUPS TABLE POLICIES
-- ============================================

-- Teachers can manage their own groups
CREATE POLICY "teachers_manage_own_groups" ON groups
    FOR ALL 
    USING (teacher_id = auth.uid());

-- Students can view groups they're in
CREATE POLICY "students_view_groups" ON groups
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM group_members 
        WHERE group_id = groups.id AND student_id = auth.uid()
    ));

-- Admins can do everything
CREATE POLICY "admin_all_groups" ON groups
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- GROUP MEMBERS POLICIES
-- ============================================

-- Teachers can manage members of their groups
CREATE POLICY "teachers_manage_group_members" ON group_members
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM groups WHERE id = group_members.group_id AND teacher_id = auth.uid()
    ));

-- Students can view their own memberships
CREATE POLICY "students_view_own_memberships" ON group_members
    FOR SELECT 
    USING (student_id = auth.uid());

-- Admins can do everything
CREATE POLICY "admin_all_group_members" ON group_members
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- EXAMS TABLE POLICIES
-- ============================================

-- Teachers can manage their own exams
CREATE POLICY "teachers_manage_own_exams" ON exams
    FOR ALL 
    USING (teacher_id = auth.uid());

-- Students can view published exams (global or for their groups)
CREATE POLICY "students_view_published_exams" ON exams
    FOR SELECT 
    USING (
        is_published = TRUE AND (
            group_id IS NULL OR 
            EXISTS (
                SELECT 1 FROM group_members 
                WHERE group_id = exams.group_id AND student_id = auth.uid()
            )
        )
    );

-- Admins can do everything
CREATE POLICY "admin_all_exams" ON exams
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- QUESTIONS TABLE POLICIES
-- ============================================

-- Teachers can manage questions for their exams
CREATE POLICY "teachers_manage_own_questions" ON questions
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM exams WHERE id = questions.exam_id AND teacher_id = auth.uid()
    ));

-- Students can view questions for published exams
CREATE POLICY "students_view_published_questions" ON questions
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM exams 
        WHERE id = questions.exam_id 
        AND is_published = TRUE 
        AND (
            group_id IS NULL OR 
            EXISTS (
                SELECT 1 FROM group_members 
                WHERE group_id = exams.group_id AND student_id = auth.uid()
            )
        )
    ));

-- Admins can do everything
CREATE POLICY "admin_all_questions" ON questions
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- EXAM RESULTS POLICIES
-- ============================================

-- Students can manage their own results
CREATE POLICY "students_manage_own_results" ON exam_results
    FOR ALL 
    USING (student_id = auth.uid());

-- Teachers can view results for their exams
CREATE POLICY "teachers_view_results" ON exam_results
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM exams WHERE id = exam_results.exam_id AND teacher_id = auth.uid()
    ));

-- Admins can do everything
CREATE POLICY "admin_all_exam_results" ON exam_results
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- Insert a super admin (replace with your Telegram ID)
-- INSERT INTO users (telegram_id, first_name, role) 
-- VALUES (123456789, 'Super Admin', 'admin')
-- ON CONFLICT (telegram_id) DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- 1. Replace 123456789 with your actual Telegram ID for admin access
-- 2. In production, sync auth.uid() with users.id through Telegram authentication
-- 3. For service role operations (like bot registration), bypass RLS by using service_role key
-- 4. Indexes are created for performance on large datasets
