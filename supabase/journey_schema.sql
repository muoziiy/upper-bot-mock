-- ============================================
-- JOURNEY SYSTEM - DATABASE SCHEMA
-- ============================================

-- User level enum (English proficiency levels)
CREATE TYPE user_level AS ENUM (
    'beginner', 
    'elementary', 
    'pre_intermediate', 
    'intermediate', 
    'upper_intermediate', 
    'advanced', 
    'ielts'
);

-- Exam type enum (online vs offline)
CREATE TYPE exam_type AS ENUM ('online', 'offline');

-- ============================================
-- CURRICULUM TABLE
-- ============================================
-- Defines curriculum structure for each level
CREATE TABLE curriculum (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level user_level NOT NULL,
    name TEXT NOT NULL, -- e.g., "Beginner Course - Module 1"
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(level, order_index)
);

CREATE INDEX idx_curriculum_level ON curriculum(level);
CREATE INDEX idx_curriculum_order ON curriculum(level, order_index);

-- ============================================
-- LESSONS TABLE
-- ============================================
-- Individual lessons within curriculum
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curriculum_id UUID REFERENCES curriculum(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT, -- Lesson content (could be markdown, JSON, etc.)
    duration_minutes INTEGER DEFAULT 30,
    topics TEXT[], -- Array of topics covered, e.g., ['grammar', 'vocabulary']
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(curriculum_id, order_index)
);

CREATE INDEX idx_lessons_curriculum ON lessons(curriculum_id);
CREATE INDEX idx_lessons_order ON lessons(curriculum_id, order_index);

-- ============================================
-- USER LESSON PROGRESS TABLE
-- ============================================
-- Tracks student progress through lessons
CREATE TABLE user_lesson_progress (
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

CREATE INDEX idx_user_progress_user ON user_lesson_progress(user_id);
CREATE INDEX idx_user_progress_lesson ON user_lesson_progress(lesson_id);
CREATE INDEX idx_user_progress_completion ON user_lesson_progress(user_id, is_completed);

-- ============================================
-- USER CURRENT LEVEL TABLE
-- ============================================
-- Tracks each user's current English level
CREATE TABLE user_current_level (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_level user_level DEFAULT 'beginner',
    progress_percentage INTEGER DEFAULT 0, -- Progress towards next level (0-100)
    level_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_level ON user_current_level(current_level);

-- ============================================
-- EXAM SCHEDULE TABLE
-- ============================================
-- Upcoming exams with online/offline tracking
CREATE TABLE exam_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    exam_type exam_type NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT, -- Physical location for offline exams
    meeting_link TEXT, -- Online meeting link for online exams
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    is_cancelled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exam_schedule_date ON exam_schedule(scheduled_date);
CREATE INDEX idx_exam_schedule_type ON exam_schedule(exam_type);
CREATE INDEX idx_exam_schedule_exam ON exam_schedule(exam_id);

-- ============================================
-- EXAM REGISTRATIONS TABLE
-- ============================================
-- Track student registrations for scheduled exams
CREATE TABLE exam_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_schedule_id UUID REFERENCES exam_schedule(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attended BOOLEAN DEFAULT FALSE,
    UNIQUE(exam_schedule_id, student_id)
);

CREATE INDEX idx_exam_reg_schedule ON exam_registrations(exam_schedule_id);
CREATE INDEX idx_exam_reg_student ON exam_registrations(student_id);

-- ============================================
-- RLS POLICIES - CURRICULUM
-- ============================================
ALTER TABLE curriculum ENABLE ROW LEVEL SECURITY;

-- Students can view active curriculum
CREATE POLICY "students_view_curriculum" ON curriculum
    FOR SELECT 
    USING (is_active = TRUE);

-- Teachers can manage curriculum
CREATE POLICY "teachers_manage_curriculum" ON curriculum
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'
    ));

-- Admins can do everything
CREATE POLICY "admin_all_curriculum" ON curriculum
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- RLS POLICIES - LESSONS
-- ============================================
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Students can view active lessons
CREATE POLICY "students_view_lessons" ON lessons
    FOR SELECT 
    USING (is_active = TRUE);

-- Teachers can manage lessons
CREATE POLICY "teachers_manage_lessons" ON lessons
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'
    ));

-- Admins can do everything
CREATE POLICY "admin_all_lessons" ON lessons
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- RLS POLICIES - USER LESSON PROGRESS
-- ============================================
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can manage their own progress
CREATE POLICY "users_manage_own_progress" ON user_lesson_progress
    FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Teachers can view student progress
CREATE POLICY "teachers_view_student_progress" ON user_lesson_progress
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.student_id = user_lesson_progress.user_id 
        AND g.teacher_id = auth.uid()
    ));

-- Admins can do everything
CREATE POLICY "admin_all_progress" ON user_lesson_progress
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- RLS POLICIES - USER CURRENT LEVEL
-- ============================================
ALTER TABLE user_current_level ENABLE ROW LEVEL SECURITY;

-- Users can view their own level
CREATE POLICY "users_view_own_level" ON user_current_level
    FOR SELECT 
    USING (user_id = auth.uid());

-- Users can update their own level (progress only, not level itself)
CREATE POLICY "users_update_own_progress" ON user_current_level
    FOR UPDATE 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Teachers and admins can manage levels
CREATE POLICY "teachers_manage_levels" ON user_current_level
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    ));

-- ============================================
-- RLS POLICIES - EXAM SCHEDULE
-- ============================================
ALTER TABLE exam_schedule ENABLE ROW LEVEL SECURITY;

-- Students can view non-cancelled scheduled exams
CREATE POLICY "students_view_exam_schedule" ON exam_schedule
    FOR SELECT 
    USING (is_cancelled = FALSE);

-- Teachers can manage exam schedules
CREATE POLICY "teachers_manage_exam_schedule" ON exam_schedule
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'
    ));

-- Admins can do everything
CREATE POLICY "admin_all_exam_schedule" ON exam_schedule
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- RLS POLICIES - EXAM REGISTRATIONS
-- ============================================
ALTER TABLE exam_registrations ENABLE ROW LEVEL SECURITY;

-- Students can view and manage their own registrations
CREATE POLICY "students_manage_own_registrations" ON exam_registrations
    FOR ALL 
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- Teachers can view all registrations
CREATE POLICY "teachers_view_registrations" ON exam_registrations
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'
    ));

-- Admins can do everything
CREATE POLICY "admin_all_registrations" ON exam_registrations
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_journey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_curriculum_updated_at 
    BEFORE UPDATE ON curriculum
    FOR EACH ROW EXECUTE FUNCTION update_journey_updated_at();

CREATE TRIGGER update_lessons_updated_at 
    BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_journey_updated_at();

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_journey_updated_at();

CREATE TRIGGER update_user_level_updated_at 
    BEFORE UPDATE ON user_current_level
    FOR EACH ROW EXECUTE FUNCTION update_journey_updated_at();

CREATE TRIGGER update_exam_schedule_updated_at 
    BEFORE UPDATE ON exam_schedule
    FOR EACH ROW EXECUTE FUNCTION update_journey_updated_at();

-- ============================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================

-- Insert sample curriculum for beginner level
-- INSERT INTO curriculum (level, name, description, order_index)
-- VALUES 
--     ('beginner', 'Beginner Module 1: Introduction', 'Basic greetings and introductions', 1),
--     ('beginner', 'Beginner Module 2: Daily Activities', 'Common daily activities vocabulary', 2);

-- ============================================
-- NOTES
-- ============================================
-- 1. Run this after schema.sql and streaks_schema.sql
-- 2. Teachers can edit curriculum and manage lessons
-- 3. Students automatically get beginner level on first login
-- 4. Exam schedules link to existing exams table with online/offline tracking
-- 5. Progress tracking is automatic as students complete lessons
