-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('guest', 'student', 'teacher', 'admin');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'text', 'boolean');

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    role user_role DEFAULT 'guest',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GROUPS TABLE
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GROUP MEMBERS TABLE
CREATE TABLE group_members (
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, student_id)
);

-- EXAMS TABLE
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL, -- If NULL, global exam? Or specific logic.
    is_published BOOLEAN DEFAULT FALSE,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUESTIONS TABLE
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type question_type DEFAULT 'multiple_choice',
    options JSONB, -- Array of options for MCQ e.g. [{"id": 1, "text": "A"}, ...]
    correct_answer JSONB, -- The correct answer key/value
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXAM RESULTS TABLE
CREATE TABLE exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    answers JSONB, -- Student's answers
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT FALSE
);

-- RLS POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role (mock implementation for now, usually relies on auth.uid())
-- In a real Supabase setup with Telegram Auth, we might link auth.users to public.users
-- For this schema, we assume the application handles auth and we might use a service role or custom claims.
-- However, standard RLS relies on `auth.uid()`.
-- Let's assume we have a trigger or logic that syncs auth.users with public.users.

-- POLICIES (Simplified for clarity, assuming we can match auth.uid() to users.id)

-- USERS
-- Admins can do everything
CREATE POLICY "Admins can do everything on users" ON users
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- GROUPS
-- Teachers can view/edit their own groups
CREATE POLICY "Teachers can manage own groups" ON groups
    FOR ALL USING (teacher_id = auth.uid());

-- Students can view groups they are in (via group_members)
CREATE POLICY "Students can view their groups" ON groups
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM group_members WHERE group_id = groups.id AND student_id = auth.uid())
    );

-- EXAMS
-- Teachers can manage exams for their groups
CREATE POLICY "Teachers can manage exams" ON exams
    FOR ALL USING (teacher_id = auth.uid());

-- Students can view published exams assigned to their group
CREATE POLICY "Students can view exams" ON exams
    FOR SELECT USING (
        is_published = TRUE AND (
            group_id IS NULL OR -- Global exam
            EXISTS (SELECT 1 FROM group_members WHERE group_id = exams.group_id AND student_id = auth.uid())
        )
    );

-- EXAM RESULTS
-- Students can view/create their own results
CREATE POLICY "Students can manage own results" ON exam_results
    FOR ALL USING (student_id = auth.uid());

-- Teachers can view results for their exams
CREATE POLICY "Teachers can view results" ON exam_results
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM exams WHERE id = exam_results.exam_id AND teacher_id = auth.uid())
    );

