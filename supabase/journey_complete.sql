-- ============================================
-- JOURNEY SYSTEM - COMPLETE DATABASE SETUP
-- ============================================
-- This file includes:
-- 1. Core Journey schema (levels, curriculum, lessons, progress)
-- 2. Group-based filtering (RLS policies)
-- 3. Sample data for testing
-- 4. Group assignments
--
-- Run this AFTER schema.sql and streaks_schema.sql
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
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
-- CORE TABLES
-- ============================================

-- CURRICULUM TABLE
CREATE TABLE curriculum (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level user_level NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE, -- For group filtering
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(level, order_index)
);

CREATE INDEX idx_curriculum_level ON curriculum(level);
CREATE INDEX idx_curriculum_order ON curriculum(level, order_index);
CREATE INDEX idx_curriculum_group ON curriculum(group_id);

-- LESSONS TABLE
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curriculum_id UUID REFERENCES curriculum(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    duration_minutes INTEGER DEFAULT 30,
    topics TEXT[],
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE, -- Can override curriculum's group
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(curriculum_id, order_index)
);

CREATE INDEX idx_lessons_curriculum ON lessons(curriculum_id);
CREATE INDEX idx_lessons_order ON lessons(curriculum_id, order_index);
CREATE INDEX idx_lessons_group ON lessons(group_id);

-- USER LESSON PROGRESS TABLE
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

-- USER CURRENT LEVEL TABLE
CREATE TABLE user_current_level (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_level user_level DEFAULT 'beginner',
    progress_percentage INTEGER DEFAULT 0,
    level_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_level ON user_current_level(current_level);

-- EXAM SCHEDULE TABLE
CREATE TABLE exam_schedule (
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

CREATE INDEX idx_exam_schedule_date ON exam_schedule(scheduled_date);
CREATE INDEX idx_exam_schedule_type ON exam_schedule(exam_type);
CREATE INDEX idx_exam_schedule_exam ON exam_schedule(exam_id);

-- EXAM REGISTRATIONS TABLE
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
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_current_level ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_registrations ENABLE ROW LEVEL SECURITY;

-- CURRICULUM POLICIES (with group filtering)
CREATE POLICY "students_view_curriculum" ON curriculum
    FOR SELECT 
    USING (
        is_active = TRUE AND (
            group_id IS NULL 
            OR 
            EXISTS (
                SELECT 1 FROM group_members 
                WHERE group_id = curriculum.group_id AND student_id = auth.uid()
            )
        )
    );

CREATE POLICY "teachers_manage_curriculum" ON curriculum
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'
        ) AND (
            group_id IS NULL 
            OR 
            EXISTS (
                SELECT 1 FROM groups 
                WHERE id = curriculum.group_id AND teacher_id = auth.uid()
            )
        )
    );

CREATE POLICY "admin_all_curriculum" ON curriculum
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- LESSONS POLICIES (with group filtering)
CREATE POLICY "students_view_lessons" ON lessons
    FOR SELECT 
    USING (
        is_active = TRUE AND (
            (
                group_id IS NULL 
                OR 
                EXISTS (
                    SELECT 1 FROM group_members 
                    WHERE group_id = lessons.group_id AND student_id = auth.uid()
                )
            )
            AND
            (
                curriculum_id IS NULL
                OR
                EXISTS (
                    SELECT 1 FROM curriculum c
                    WHERE c.id = lessons.curriculum_id
                    AND (
                        c.group_id IS NULL
                        OR
                        EXISTS (
                            SELECT 1 FROM group_members gm
                            WHERE gm.group_id = c.group_id AND gm.student_id = auth.uid()
                        )
                    )
                )
            )
        )
    );

CREATE POLICY "teachers_manage_lessons" ON lessons
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'
        ) AND (
            (
                group_id IS NULL 
                OR 
                EXISTS (
                    SELECT 1 FROM groups 
                    WHERE id = lessons.group_id AND teacher_id = auth.uid()
                )
            )
            AND
            (
                curriculum_id IS NULL
                OR
                EXISTS (
                    SELECT 1 FROM curriculum c
                    JOIN groups g ON g.id = c.group_id
                    WHERE c.id = lessons.curriculum_id
                    AND (c.group_id IS NULL OR g.teacher_id = auth.uid())
                )
            )
        )
    );

CREATE POLICY "admin_all_lessons" ON lessons
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- USER LESSON PROGRESS POLICIES
CREATE POLICY "users_manage_own_progress" ON user_lesson_progress
    FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "teachers_view_student_progress" ON user_lesson_progress
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.student_id = user_lesson_progress.user_id 
        AND g.teacher_id = auth.uid()
    ));

CREATE POLICY "admin_all_progress" ON user_lesson_progress
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- USER CURRENT LEVEL POLICIES
CREATE POLICY "users_view_own_level" ON user_current_level
    FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "users_update_own_progress" ON user_current_level
    FOR UPDATE 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "teachers_manage_levels" ON user_current_level
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    ));

-- EXAM SCHEDULE POLICIES
CREATE POLICY "students_view_exam_schedule" ON exam_schedule
    FOR SELECT 
    USING (is_cancelled = FALSE);

CREATE POLICY "teachers_manage_exam_schedule" ON exam_schedule
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'
    ));

CREATE POLICY "admin_all_exam_schedule" ON exam_schedule
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- EXAM REGISTRATIONS POLICIES
CREATE POLICY "students_manage_own_registrations" ON exam_registrations
    FOR ALL 
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "teachers_view_registrations" ON exam_registrations
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'
    ));

CREATE POLICY "admin_all_registrations" ON exam_registrations
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_journey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- SAMPLE DATA
-- ============================================

-- Insert comprehensive curriculum for all levels
INSERT INTO curriculum (level, name, description, order_index) VALUES 
    -- BEGINNER
    ('beginner', 'Beginner Module 1: Getting Started', 'Introduction to English - greetings, basic phrases, and alphabet', 1),
    ('beginner', 'Beginner Module 2: Daily Life', 'Vocabulary for everyday activities and routines', 2),
    ('beginner', 'Beginner Module 3: Family & Friends', 'Talking about people, relationships, and descriptions', 3),
    ('beginner', 'Beginner Module 4: Food & Drinks', 'Restaurant vocabulary and food preferences', 4),
    
    -- ELEMENTARY
    ('elementary', 'Elementary Module 1: Present Tense Mastery', 'Understanding and using present tenses effectively', 1),
    ('elementary', 'Elementary Module 2: Shopping & Money', 'Practical vocabulary for shopping and financial conversations', 2),
    ('elementary', 'Elementary Module 3: Hobbies & Interests', 'Discussing activities and personal interests', 3),
    ('elementary', 'Elementary Module 4: Telling Time & Schedules', 'Time expressions and daily schedules', 4),
    
    -- PRE-INTERMEDIATE
    ('pre_intermediate', 'Pre-Intermediate Module 1: Past Tense Stories', 'Narrating events in the past with detail', 1),
    ('pre_intermediate', 'Pre-Intermediate Module 2: Travel & Directions', 'Vocabulary and phrases for traveling and navigating', 2),
    ('pre_intermediate', 'Pre-Intermediate Module 3: Health & Wellness', 'Medical vocabulary and health discussions', 3),
    ('pre_intermediate', 'Pre-Intermediate Module 4: Making Plans', 'Future tenses and planning conversations', 4),
    
    -- INTERMEDIATE
    ('intermediate', 'Intermediate Module 1: Expressing Opinions', 'Advanced communication and debate skills', 1),
    ('intermediate', 'Intermediate Module 2: Business English Basics', 'Professional communication fundamentals', 2),
    ('intermediate', 'Intermediate Module 3: Technology & Media', 'Modern tech vocabulary and social media', 3),
    ('intermediate', 'Intermediate Module 4: Cultural Awareness', 'Cross-cultural communication skills', 4),
    
    -- UPPER-INTERMEDIATE
    ('upper_intermediate', 'Upper-Intermediate Module 1: Advanced Grammar', 'Complex sentence structures and conditionals', 1),
    ('upper_intermediate', 'Upper-Intermediate Module 2: Presentations & Public Speaking', 'Professional presentation skills', 2),
    ('upper_intermediate', 'Upper-Intermediate Module 3: Academic Writing', 'Essays, reports, and formal writing', 3),
    ('upper_intermediate', 'Upper-Intermediate Module 4: Idioms & Expressions', 'Natural English expressions and idioms', 4),
    
    -- ADVANCED
    ('advanced', 'Advanced Module 1: Nuanced Communication', 'Subtle meanings and advanced vocabulary', 1),
    ('advanced', 'Advanced Module 2: Critical Thinking', 'Analysis, argumentation, and logic in English', 2),
    ('advanced', 'Advanced Module 3: Literature & Poetry', 'Understanding complex texts and literary devices', 3),
    ('advanced', 'Advanced Module 4: Professional English', 'Industry-specific vocabulary and communication', 4),
    
    -- IELTS
    ('ielts', 'IELTS Module 1: Listening Skills', 'IELTS listening test strategies and practice', 1),
    ('ielts', 'IELTS Module 2: Reading Comprehension', 'Academic and general reading techniques', 2),
    ('ielts', 'IELTS Module 3: Writing Tasks', 'Task 1 and Task 2 writing strategies', 3),
    ('ielts', 'IELTS Module 4: Speaking Test Prep', 'Speaking test format and practice', 4)
ON CONFLICT DO NOTHING;

-- Insert sample lessons (selection across levels)
INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Greetings & Introductions', 'Learn how to greet people and introduce yourself', 
    'Master basic greetings: Hello, Hi, Good morning, Good afternoon, Good evening. Practice introducing yourself with "My name is..." and "I am from..."',
    30, ARRAY['greetings', 'introductions', 'vocabulary'], 1
FROM curriculum c WHERE c.name LIKE '%Getting Started%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 2: Numbers & Alphabet', 'Master English numbers and the alphabet', 
    'Learn to count from 1-100, spell words using the alphabet, and practice phone numbers.',
    45, ARRAY['numbers', 'alphabet', 'pronunciation'], 2
FROM curriculum c WHERE c.name LIKE '%Getting Started%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 3: Basic Questions', 'Learn to ask and answer simple questions', 
    'Question words: Who, What, Where, When, Why, How. Practice forming and answering basic questions.',
    40, ARRAY['questions', 'grammar', 'conversation'], 3
FROM curriculum c WHERE c.name LIKE '%Getting Started%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Daily Routines', 'Vocabulary for describing your daily activities', 
    'Learn verbs for daily actions: wake up, brush teeth, eat breakfast, go to work, etc.',
    35, ARRAY['daily-routines', 'verbs', 'vocabulary'], 1
FROM curriculum c WHERE c.name LIKE '%Daily Life%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Simple Present', 'Master the simple present tense', 
    'Learn to use simple present for habits, facts, and routines. Practice with daily activities.',
    45, ARRAY['grammar', 'present-tense', 'structure'], 1
FROM curriculum c WHERE c.name LIKE '%Present Tense Mastery%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: IELTS Listening Part 1 & 2', 'Practice social and everyday contexts', 
    'Master note-taking and prediction skills for IELTS listening sections 1 and 2.',
    60, ARRAY['IELTS', 'listening', 'test-strategy'], 1
FROM curriculum c WHERE c.name LIKE '%Listening Skills%';

-- Create sample exams
INSERT INTO exams (title, description, is_published, start_time, end_time, duration_minutes)
VALUES 
    ('Beginner Level Assessment', 'Test your basic English skills - reading, writing, listening', true, 
     NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '2 hours', 90),
    
    ('Elementary Proficiency Test', 'Evaluate your elementary English competency', true, 
     NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '90 minutes', 90),
    
    ('Pre-Intermediate Exam', 'Mid-level English assessment covering all skills', true, 
     NOW() + INTERVAL '15 days', NOW() + INTERVAL '15 days' + INTERVAL '2 hours', 120),
    
    ('Intermediate Business English Test', 'Professional English communication assessment', true, 
     NOW() + INTERVAL '20 days', NOW() + INTERVAL '20 days' + INTERVAL '2 hours', 120),
    
    ('IELTS Practice Test (Full)', 'Complete IELTS practice exam - all sections', true, 
     NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days' + INTERVAL '3 hours', 180),
    
    ('Grammar Challenge Quiz', 'Quick grammar assessment for all levels', true, 
     NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour', 60)
ON CONFLICT DO NOTHING;

-- Create exam schedules (online & offline)
INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, location, max_participants, current_participants)
SELECT id, 'offline', NOW() + INTERVAL '5 days', 'Room 101, Main Building, 3rd Floor', 25, 18
FROM exams WHERE title = 'Beginner Level Assessment';

INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, meeting_link, max_participants, current_participants)
SELECT id, 'online', NOW() + INTERVAL '10 days', 'https://zoom.us/j/elementary-exam-2024', 50, 32
FROM exams WHERE title = 'Elementary Proficiency Test';

INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, location, max_participants, current_participants)
SELECT id, 'offline', NOW() + INTERVAL '15 days', 'Computer Lab A, 2nd Floor', 30, 15
FROM exams WHERE title = 'Pre-Intermediate Exam';

INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, meeting_link, max_participants, current_participants)
SELECT id, 'online', NOW() + INTERVAL '20 days', 'https://meet.google.com/intermediate-business', 40, 28
FROM exams WHERE title = 'Intermediate Business English Test';

INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, location, max_participants, current_participants)
SELECT id, 'offline', NOW() + INTERVAL '30 days', 'IELTS Testing Center, Downtown Campus', 20, 19
FROM exams WHERE title = 'IELTS Practice Test (Full)';

INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, meeting_link, max_participants, current_participants)
SELECT id, 'online', NOW() + INTERVAL '3 days', 'https://teams.microsoft.com/grammar-quiz', 100, 45
FROM exams WHERE title = 'Grammar Challenge Quiz';

-- Additional urgent exam
INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, location, max_participants, current_participants)
SELECT id, 'offline', NOW() + INTERVAL '1 day', 'Room 205, Language Center', 25, 24
FROM exams WHERE title = 'Beginner Level Assessment';

-- ============================================
-- NOTES
-- ============================================
-- 1. Run after schema.sql and streaks_schema.sql
-- 2. All content starts as global (group_id NULL)
-- 3. To assign content to groups, update group_id column
-- 4. To set user level: UPDATE user_current_level SET current_level = 'beginner', progress_percentage = 25 WHERE user_id = 'UUID';
-- 5. To mark lesson complete: INSERT INTO user_lesson_progress (user_id, lesson_id, is_completed, completion_date) VALUES (...);
