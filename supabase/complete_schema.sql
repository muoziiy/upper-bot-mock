-- ============================================
-- EDUCATION CENTER BOT - COMPLETE CONSOLIDATED SCHEMA
-- ============================================
-- This is the single source of truth for the entire database schema
-- Run this fresh on a new database, or use it as reference

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS (Idempotent creation)
-- ============================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('guest', 'student', 'teacher', 'admin', 'super_admin', 'parent', 'waiting_user', 'waiting_staff', 'new_user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('multiple_choice', 'text', 'boolean');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_level AS ENUM ('beginner', 'elementary', 'pre_intermediate', 'intermediate', 'upper_intermediate', 'advanced', 'ielts');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE exam_type AS ENUM ('online', 'offline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 1. CORE TABLES
-- ============================================

-- USERS TABLE
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

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);

-- Function to generate unique 6-digit student_id
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
        -- Generate random 6-digit number
        new_id := floor(random() * (999999 - 100000 + 1) + 100000)::TEXT;
        
        -- Check if it exists
        PERFORM 1 FROM users WHERE student_id = new_id;
        IF NOT FOUND THEN
            done := TRUE;
        END IF;
    END LOOP;

    NEW.student_id := new_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to assign student_id on insert
DROP TRIGGER IF EXISTS trigger_assign_student_id ON users;
CREATE TRIGGER trigger_assign_student_id
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION generate_unique_student_id();

-- GROUPS TABLE
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON groups(teacher_id);

-- GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS group_members (
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_student_id ON group_members(student_id);

-- SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TEACHER SUBJECTS TABLE (Many-to-Many)
CREATE TABLE IF NOT EXISTS teacher_subjects (
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_id, subject_id)
);

-- EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
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

CREATE INDEX IF NOT EXISTS idx_exams_teacher_id ON exams(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exams_group_id ON exams(group_id);
CREATE INDEX IF NOT EXISTS idx_exams_published ON exams(is_published);

-- QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
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

CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);

-- EXAM RESULTS TABLE
CREATE TABLE IF NOT EXISTS exam_results (
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

CREATE INDEX IF NOT EXISTS idx_exam_results_student_id ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);

-- ============================================
-- 2. PARENT-CHILDREN RELATIONSHIP
-- ============================================
CREATE TABLE IF NOT EXISTS parent_children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_student ON parent_children(student_id);

-- ============================================
-- 3. PAYMENT & ATTENDANCE RECORDS
-- ============================================

-- PAYMENT RECORDS TABLE
CREATE TABLE IF NOT EXISTS payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'paid', 'pending', 'unpaid'
    month INTEGER, -- 1-12
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_records_student ON payment_records(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_group ON payment_records(group_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_date ON payment_records(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);

-- ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status TEXT DEFAULT 'present', -- 'present', 'absent', 'late'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, group_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_group ON attendance_records(group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);

-- ============================================
-- 4. ADMIN REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS admin_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'declined'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status);

-- ============================================
-- 5. STREAK SYSTEM
-- ============================================

-- User daily activity tracking
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

CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity(user_id, activity_date DESC);

-- User streak tracking
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_active_days INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. ACHIEVEMENTS & BADGES
-- ============================================

-- Achievement definitions
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

CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);

-- User unlocked achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notified BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);

-- ============================================
-- 7. LEADERBOARDS
-- ============================================

-- Leaderboard entries
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'global', 'weekly', 'monthly', 'class'
    score INTEGER DEFAULT 0,
    rank INTEGER,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    period TEXT,
    metadata JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category, period, group_id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_category_period ON leaderboard_entries(category, period, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_group ON leaderboard_entries(group_id) WHERE group_id IS NOT NULL;

-- ============================================
-- 8. SOCIAL FEATURES
-- ============================================

-- Study Groups
CREATE TABLE IF NOT EXISTS study_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_groups_active ON study_groups(is_active) WHERE is_active = true;

-- Study Group Members
CREATE TABLE IF NOT EXISTS study_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_user ON study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON study_group_members(group_id);

-- Challenges
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

CREATE INDEX IF NOT EXISTS idx_challenges_creator ON challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_challenges_opponent ON challenges(opponent_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);

-- ============================================
-- 9. JOURNEY SYSTEM
-- ============================================

-- Curriculum
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

CREATE INDEX IF NOT EXISTS idx_curriculum_level ON curriculum(level);
CREATE INDEX IF NOT EXISTS idx_curriculum_order ON curriculum(level, order_index);

-- Lessons
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

CREATE INDEX IF NOT EXISTS idx_lessons_curriculum ON lessons(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(curriculum_id, order_index);

-- User Lesson Progress
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

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completion ON user_lesson_progress(user_id, is_completed);

-- User Current Level
CREATE TABLE IF NOT EXISTS user_current_level (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_level user_level DEFAULT 'beginner',
    progress_percentage INTEGER DEFAULT 0,
    level_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_level ON user_current_level(current_level);

-- Exam Schedule
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

CREATE INDEX IF NOT EXISTS idx_exam_schedule_date ON exam_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_exam_schedule_type ON exam_schedule(exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_schedule_exam ON exam_schedule(exam_id);

-- Exam Registrations
CREATE TABLE IF NOT EXISTS exam_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_schedule_id UUID REFERENCES exam_schedule(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attended BOOLEAN DEFAULT FALSE,
    UNIQUE(exam_schedule_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_reg_schedule ON exam_registrations(exam_schedule_id);
CREATE INDEX IF NOT EXISTS idx_exam_reg_student ON exam_registrations(student_id);

-- ============================================
-- RLS POLICIES (Consolidated)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_current_level ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid errors
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "parents_view_children_users" ON users;
DROP POLICY IF EXISTS "super_admins_manage_users" ON users;
DROP POLICY IF EXISTS "students_view_groups" ON groups;
DROP POLICY IF EXISTS "parents_view_children_groups" ON groups;
DROP POLICY IF EXISTS "everyone_view_subjects" ON subjects;
DROP POLICY IF EXISTS "admins_manage_subjects" ON subjects;
DROP POLICY IF EXISTS "everyone_view_teacher_subjects" ON teacher_subjects;
DROP POLICY IF EXISTS "teachers_manage_own_subjects" ON teacher_subjects;
DROP POLICY IF EXISTS "admins_manage_teacher_subjects" ON teacher_subjects;
DROP POLICY IF EXISTS "students_view_published_exams" ON exams;
DROP POLICY IF EXISTS "parents_view_children_exam_results" ON exam_results;
DROP POLICY IF EXISTS "parents_view_their_children" ON parent_children;
DROP POLICY IF EXISTS "parents_view_children_payments" ON payment_records;
DROP POLICY IF EXISTS "students_view_own_payments" ON payment_records;
DROP POLICY IF EXISTS "parents_view_children_attendance" ON attendance_records;
DROP POLICY IF EXISTS "students_view_own_attendance" ON attendance_records;
DROP POLICY IF EXISTS "users_create_requests" ON admin_requests;
DROP POLICY IF EXISTS "users_view_own_requests" ON admin_requests;
DROP POLICY IF EXISTS "super_admins_view_all_requests" ON admin_requests;
DROP POLICY IF EXISTS "super_admins_update_requests" ON admin_requests;
DROP POLICY IF EXISTS "users_read_own_streak" ON user_streaks;
DROP POLICY IF EXISTS "public_read_achievements" ON achievements;
DROP POLICY IF EXISTS "users_read_own_achievements" ON user_achievements;
DROP POLICY IF EXISTS "public_read_leaderboard" ON leaderboard_entries;
DROP POLICY IF EXISTS "students_view_curriculum" ON curriculum;
DROP POLICY IF EXISTS "students_view_lessons" ON lessons;
DROP POLICY IF EXISTS "users_manage_own_progress" ON user_lesson_progress;
DROP POLICY IF EXISTS "parents_view_children_progress" ON user_lesson_progress;
DROP POLICY IF EXISTS "parents_view_children_level" ON user_current_level;

-- USERS
CREATE POLICY "users_read_own" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "parents_view_children_users" ON users FOR SELECT USING (
    id IN (
        SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
    ) OR id = auth.uid()
);
CREATE POLICY "super_admins_manage_users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);

-- GROUPS
CREATE POLICY "students_view_groups" ON groups FOR SELECT USING (EXISTS (SELECT 1 FROM group_members WHERE group_id = groups.id AND student_id = auth.uid()));
CREATE POLICY "parents_view_children_groups" ON groups FOR SELECT USING (
    id IN (
        SELECT group_id FROM group_members 
        WHERE student_id IN (
            SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
        )
    )
);

-- SUBJECTS
CREATE POLICY "everyone_view_subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "admins_manage_subjects" ON subjects FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- TEACHER SUBJECTS
CREATE POLICY "everyone_view_teacher_subjects" ON teacher_subjects FOR SELECT USING (true);
CREATE POLICY "teachers_manage_own_subjects" ON teacher_subjects FOR ALL USING (
    auth.uid() = teacher_id
);
CREATE POLICY "admins_manage_teacher_subjects" ON teacher_subjects FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- EXAMS
CREATE POLICY "students_view_published_exams" ON exams FOR SELECT USING (is_published = TRUE);

-- EXAM RESULTS
CREATE POLICY "parents_view_children_exam_results" ON exam_results FOR SELECT USING (
    student_id IN (
        SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
    )
);

-- PARENT-CHILDREN
CREATE POLICY "parents_view_their_children" ON parent_children FOR SELECT USING (parent_id = auth.uid());

-- PAYMENT RECORDS
CREATE POLICY "parents_view_children_payments" ON payment_records FOR SELECT USING (
    student_id IN (
        SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
    )
);
CREATE POLICY "students_view_own_payments" ON payment_records FOR SELECT USING (student_id = auth.uid());

-- ATTENDANCE RECORDS
CREATE POLICY "parents_view_children_attendance" ON attendance_records FOR SELECT USING (
    student_id IN (
        SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
    )
);
CREATE POLICY "students_view_own_attendance" ON attendance_records FOR SELECT USING (student_id = auth.uid());

-- ADMIN REQUESTS
CREATE POLICY "users_create_requests" ON admin_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_view_own_requests" ON admin_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "super_admins_view_all_requests" ON admin_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "super_admins_update_requests" ON admin_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);

-- STREAKS
CREATE POLICY "users_read_own_streak" ON user_streaks FOR SELECT USING (user_id = auth.uid());

-- ACHIEVEMENTS
CREATE POLICY "public_read_achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "users_read_own_achievements" ON user_achievements FOR SELECT USING (user_id = auth.uid());

-- LEADERBOARD
CREATE POLICY "public_read_leaderboard" ON leaderboard_entries FOR SELECT USING (true);

-- JOURNEY
CREATE POLICY "students_view_curriculum" ON curriculum FOR SELECT USING (is_active = TRUE);
CREATE POLICY "students_view_lessons" ON lessons FOR SELECT USING (is_active = TRUE);
CREATE POLICY "users_manage_own_progress" ON user_lesson_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "parents_view_children_progress" ON user_lesson_progress FOR SELECT USING (
    user_id IN (
        SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
    )
);
CREATE POLICY "parents_view_children_level" ON user_current_level FOR SELECT USING (
    user_id IN (
        SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
    )
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

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

DROP TRIGGER IF EXISTS update_payment_records_updated_at ON payment_records;
CREATE TRIGGER update_payment_records_updated_at BEFORE UPDATE ON payment_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_records_updated_at ON attendance_records;
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update Streak Function
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

-- ============================================
-- SEED DATA (Subjects & Achievements)
-- ============================================

-- Insert Default Subjects
INSERT INTO subjects (name) VALUES 
('Mathematics'), ('Physics'), ('English'), ('Chemistry'), ('Biology'), ('History'), ('Geography')
ON CONFLICT (name) DO NOTHING;

-- Insert Achievements
INSERT INTO achievements (slug, name, description, icon, category, requirement, points, rarity) VALUES
('first_day', 'First Steps', 'Completed your first day of learning', '🎯', 'streak', '{"type": "streak", "value": 1}', 5, 'common'),
('week_warrior', 'Week Warrior', 'Maintained a 7-day streak', '🔥', 'streak', '{"type": "streak", "value": 7}', 15, 'rare'),
('month_master', 'Month Master', '30-day streak champion', '🏆', 'streak', '{"type": "streak", "value": 30}', 50, 'epic'),
('century_scholar', 'Century Scholar', '100-day streak legend', '👑', 'streak', '{"type": "streak", "value": 100}', 100, 'legendary'),
('first_test', 'Test Taker', 'Completed your first test', '📝', 'milestones', '{"type": "tests_completed", "value": 1}', 5, 'common'),
('perfect_score', 'Perfectionist', 'Scored 100% on a test', '💯', 'performance', '{"type": "perfect_score"}', 25, 'rare'),
('ace_student', 'Ace Student', 'Averaged 90%+ over 10 tests', '🌟', 'performance', '{"type": "high_average", "tests": 10, "score": 90}', 40, 'epic'),
('speed_demon', 'Speed Demon', 'Completed a test in under 5 minutes', '⚡', 'performance', '{"type": "fast_completion", "minutes": 5}', 20, 'rare'),
('ten_tests', 'Getting Started', 'Completed 10 tests', '📚', 'milestones', '{"type": "tests_completed", "value": 10}', 10, 'common'),
('fifty_tests', 'Dedicated Learner', 'Completed 50 tests', '📖', 'milestones', '{"type": "tests_completed", "value": 50}', 30, 'rare'),
('hundred_tests', 'Test Master', 'Completed 100 tests', '🎓', 'milestones', '{"type": "tests_completed", "value": 100}', 75, 'epic'),
('early_bird', 'Early Bird', 'Completed a test before 8 AM', '🌅', 'social', '{"type": "time_of_day", "before": 8}', 15, 'rare'),
('night_owl', 'Night Owl', 'Completed a test after 10 PM', '🦉', 'social', '{"type": "time_of_day", "after": 22}', 15, 'rare')
ON CONFLICT (slug) DO NOTHING;
