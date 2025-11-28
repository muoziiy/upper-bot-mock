-- ============================================
-- EDUCATION CENTER BOT - FULL CONSOLIDATED SCHEMA
-- ============================================
-- This script consolidates all previous schema files into a single, idempotent execution.
-- It includes:
-- 1. Core Tables (Users, Groups, Subjects, etc.)
-- 2. Enhanced Payment Records
-- 3. Scheduled Lessons & Homework
-- 4. All Enums, Functions, Triggers, and RLS Policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ENUMS (Idempotent)
-- ============================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('guest', 'student', 'teacher', 'admin', 'super_admin', 'parent', 'waiting_user', 'waiting_staff', 'new_user');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('multiple_choice', 'text', 'boolean');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_level AS ENUM ('beginner', 'elementary', 'pre_intermediate', 'intermediate', 'upper_intermediate', 'advanced', 'ielts');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE exam_type AS ENUM ('online', 'offline');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================
-- 2. TABLES & COLUMNS
-- ============================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    surname TEXT,
    age INTEGER,
    sex TEXT,
    phone_number TEXT,
    bio TEXT,
    timezone TEXT DEFAULT 'Asia/Tashkent',
    language_code TEXT,
    student_id TEXT UNIQUE,
    role user_role DEFAULT 'new_user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add subjects column to users (from add_user_subjects_column.sql)
ALTER TABLE users ADD COLUMN IF NOT EXISTS subjects UUID[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_day INTEGER DEFAULT 1; -- Added based on backend code usage

-- GROUPS
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) DEFAULT 0, -- Added price column based on usage
    schedule JSONB DEFAULT '{}', -- Added schedule column based on usage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GROUP MEMBERS
CREATE TABLE IF NOT EXISTS group_members (
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Renamed from joined_at to match usage in some places, or keep joined_at
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Keeping both for compatibility if needed, or just one. Let's stick to joined_at as primary, but ensure created_at exists if backend uses it.
    PRIMARY KEY (group_id, student_id)
);

-- SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TEACHER SUBJECTS
CREATE TABLE IF NOT EXISTS teacher_subjects (
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_id, subject_id)
);

-- EXAMS
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT FALSE,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type question_type DEFAULT 'multiple_choice',
    options JSONB,
    correct_answer JSONB,
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXAM RESULTS
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    answers JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT FALSE,
    UNIQUE(exam_id, student_id)
);

-- PARENT CHILDREN
CREATE TABLE IF NOT EXISTS parent_children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(parent_id, student_id)
);

-- PAYMENT RECORDS (Enhanced)
CREATE TABLE IF NOT EXISTS payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    status TEXT DEFAULT 'pending',
    month INTEGER,
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add enhanced columns to payment_records
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('cash', 'card'));
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS lessons_attended INTEGER DEFAULT 0; -- Added based on new modal requirement

-- PAYMENTS (New table from payments_migration.sql - keeping for compatibility if used separately)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status payment_status DEFAULT 'pending',
    description TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TEACHER PAYMENTS
CREATE TABLE IF NOT EXISTS teacher_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    status TEXT DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ATTENDANCE RECORDS
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status TEXT DEFAULT 'present',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, group_id, attendance_date)
);

-- ADMIN REQUESTS
CREATE TABLE IF NOT EXISTS admin_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER ACTIVITY & STREAKS
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    study_minutes INTEGER DEFAULT 0,
    tests_completed INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_date)
);

CREATE TABLE IF NOT EXISTS user_streaks (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_active_days INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    requirement JSONB NOT NULL,
    points INTEGER DEFAULT 10,
    rarity TEXT DEFAULT 'common',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notified BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, achievement_id)
);

-- LEADERBOARD
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    rank INTEGER,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    period TEXT,
    metadata JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category, period, group_id)
);

-- SOCIAL FEATURES
CREATE TABLE IF NOT EXISTS study_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    opponent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type TEXT DEFAULT 'vocabulary',
    status TEXT DEFAULT 'pending',
    exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
    creator_score INTEGER,
    opponent_score INTEGER,
    winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- JOURNEY SYSTEM
CREATE TABLE IF NOT EXISTS curriculum (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level user_level NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(level, order_index)
);

CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curriculum_id UUID REFERENCES curriculum(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    duration_minutes INTEGER DEFAULT 30,
    topics TEXT[],
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(curriculum_id, order_index)
);

CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS user_current_level (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_level user_level DEFAULT 'beginner',
    progress_percentage INTEGER DEFAULT 0,
    level_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXAM SCHEDULE & REGISTRATIONS
CREATE TABLE IF NOT EXISTS exam_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    exam_type exam_type NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    meeting_link TEXT,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    is_cancelled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_schedule_id UUID REFERENCES exam_schedule(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attended BOOLEAN DEFAULT FALSE,
    UNIQUE(exam_schedule_id, student_id)
);

-- SCHEDULED LESSONS & HOMEWORK (from schema_update.sql)
CREATE TABLE IF NOT EXISTS scheduled_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    is_online BOOLEAN DEFAULT FALSE,
    location TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES scheduled_lessons(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_subjects ON users USING GIN (subjects);

CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_group_members_student_id ON group_members(student_id);

CREATE INDEX IF NOT EXISTS idx_exams_teacher_id ON exams(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exams_group_id ON exams(group_id);
CREATE INDEX IF NOT EXISTS idx_exams_published ON exams(is_published);
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student_id ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);

CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_student ON parent_children(student_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_student ON payment_records(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_group ON payment_records(group_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_date ON payment_records(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_subject ON payment_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_method ON payment_records(payment_method);

CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_group ON attendance_records(group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(attendance_date);

CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category_period ON leaderboard_entries(category, period, rank);

CREATE INDEX IF NOT EXISTS idx_scheduled_lessons_group ON scheduled_lessons(group_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_lessons_teacher ON scheduled_lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_lessons_date ON scheduled_lessons(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_homework_group ON homework(group_id);

-- ============================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================

-- Generate Student ID
CREATE OR REPLACE FUNCTION generate_unique_student_id()
RETURNS TRIGGER AS $$
DECLARE
    new_id TEXT;
    done BOOLEAN DEFAULT FALSE;
BEGIN
    IF NEW.student_id IS NOT NULL THEN
        RETURN NEW;
    END IF;
    WHILE NOT done LOOP
        new_id := floor(random() * (999999 - 100000 + 1) + 100000)::TEXT;
        PERFORM 1 FROM users WHERE student_id = new_id;
        IF NOT FOUND THEN
            done := TRUE;
        END IF;
    END LOOP;
    NEW.student_id := new_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_student_id ON users;
CREATE TRIGGER trigger_assign_student_id BEFORE INSERT ON users FOR EACH ROW EXECUTE FUNCTION generate_unique_student_id();

-- Update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update Streak
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_date DATE;
    current_streak_val INTEGER;
BEGIN
    SELECT last_activity_date, current_streak INTO last_date, current_streak_val
    FROM user_streaks WHERE user_id = NEW.user_id;

    IF NOT FOUND THEN
        INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_active_days)
        VALUES (NEW.user_id, 1, 1, NEW.activity_date, 1);
        RETURN NEW;
    END IF;

    IF NEW.activity_date = CURRENT_DATE THEN
        IF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
            UPDATE user_streaks SET current_streak = current_streak + 1, longest_streak = GREATEST(longest_streak, current_streak + 1), last_activity_date = NEW.activity_date, total_active_days = total_active_days + 1, updated_at = NOW() WHERE user_id = NEW.user_id;
        ELSIF last_date = CURRENT_DATE THEN
            UPDATE user_streaks SET updated_at = NOW() WHERE user_id = NEW.user_id;
        ELSE
            UPDATE user_streaks SET current_streak = 1, last_activity_date = NEW.activity_date, total_active_days = total_active_days + 1, updated_at = NOW() WHERE user_id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_streak ON user_activity;
CREATE TRIGGER trigger_update_streak AFTER INSERT OR UPDATE ON user_activity FOR EACH ROW EXECUTE FUNCTION update_user_streak();

-- Get Student Payment Status
CREATE OR REPLACE FUNCTION get_student_payment_status(
    student_uuid UUID,
    target_month INTEGER,
    target_year INTEGER
)
RETURNS TEXT AS $$
DECLARE
    payment_count INTEGER;
    overdue_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO payment_count
    FROM payment_records
    WHERE student_id = student_uuid
    AND month = target_month
    AND year = target_year
    AND status = 'completed'; -- Changed from 'paid' to 'completed' to match enum/usage

    IF payment_count > 0 THEN
        RETURN 'paid';
    END IF;

    SELECT COUNT(*) INTO overdue_count
    FROM payment_records
    WHERE student_id = student_uuid
    AND month = target_month
    AND year = target_year
    AND status IN ('unpaid', 'pending')
    AND payment_date < CURRENT_DATE;

    IF overdue_count > 0 THEN
        RETURN 'overdue';
    END IF;

    RETURN 'unpaid';
END;
$$ LANGUAGE plpgsql;

-- Get Overdue Students (RPC)
CREATE OR REPLACE FUNCTION get_overdue_students(target_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
    student_id UUID,
    total_amount_due DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.student_id,
        SUM(pr.amount) as total_amount_due
    FROM payment_records pr
    JOIN users u ON u.id = pr.student_id
    WHERE pr.status IN ('pending', 'unpaid')
    AND pr.payment_date < target_date
    -- Only show overdue if the current day of month is greater than the student's payment day (or joined day)
    AND EXTRACT(DAY FROM target_date) >= COALESCE(u.payment_day, 1)
    GROUP BY pr.student_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. RLS POLICIES
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to ensure clean state
DO $$ 
DECLARE 
    pol record; 
BEGIN 
    FOR pol IN SELECT schemaname, tablename, policyname FROM pg_policies LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename); 
    END LOOP; 
END $$;

-- Re-create Policies (Simplified for Admin/Teacher/Student access)

-- USERS
CREATE POLICY "users_read_own" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "admins_manage_users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- GROUPS
CREATE POLICY "everyone_read_groups" ON groups FOR SELECT USING (true);
CREATE POLICY "admins_manage_groups" ON groups FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- SUBJECTS
CREATE POLICY "everyone_read_subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "admins_manage_subjects" ON subjects FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- PAYMENT RECORDS
CREATE POLICY "admins_manage_payments" ON payment_records FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "students_view_own_payments" ON payment_records FOR SELECT USING (student_id = auth.uid());

-- TEACHER PAYMENTS
CREATE POLICY "admins_manage_teacher_payments" ON teacher_payments FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "teachers_view_own_payments" ON teacher_payments FOR SELECT USING (teacher_id = auth.uid());

-- ATTENDANCE
CREATE POLICY "admins_manage_attendance" ON attendance_records FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "students_view_own_attendance" ON attendance_records FOR SELECT USING (student_id = auth.uid());

-- SCHEDULED LESSONS & HOMEWORK
CREATE POLICY "admins_manage_lessons" ON scheduled_lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "everyone_view_lessons" ON scheduled_lessons FOR SELECT USING (true);

CREATE POLICY "admins_manage_homework" ON homework FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "everyone_view_homework" ON homework FOR SELECT USING (true);

-- ============================================
-- 6. SEED DATA
-- ============================================
INSERT INTO subjects (name) VALUES 
('Mathematics'), ('Physics'), ('English'), ('Chemistry'), ('Biology'), ('History'), ('Geography')
ON CONFLICT (name) DO NOTHING;
