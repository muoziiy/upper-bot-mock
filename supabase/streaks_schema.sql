-- ============================================
-- PHASE 1: STREAK SYSTEM - DATABASE ADDITIONS
-- ============================================

-- User daily activity tracking
CREATE TABLE user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    study_minutes INTEGER DEFAULT 0,
    tests_completed INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_date)
);

CREATE INDEX idx_user_activity_user_date ON user_activity(user_id, activity_date DESC);

-- User streak tracking
CREATE TABLE user_streaks (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_active_days INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES FOR ACTIVITY TABLES
-- ============================================

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Users can read their own activity
CREATE POLICY "users_read_own_activity" ON user_activity
    FOR SELECT 
    USING (user_id = auth.uid());

-- Users can insert their own activity
CREATE POLICY "users_insert_own_activity" ON user_activity
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- Users can update their own activity (today only)
CREATE POLICY "users_update_own_activity_today" ON user_activity
    FOR UPDATE 
    USING (user_id = auth.uid() AND activity_date = CURRENT_DATE)
    WITH CHECK (user_id = auth.uid() AND activity_date = CURRENT_DATE);

-- Teachers can view their students' activity
CREATE POLICY "teachers_view_students_activity" ON user_activity
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.student_id = user_activity.user_id 
        AND g.teacher_id = auth.uid()
    ));

-- Admins can do everything
CREATE POLICY "admin_all_activity" ON user_activity
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Streak policies (similar to activity)
CREATE POLICY "users_read_own_streak" ON user_streaks
    FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "users_update_own_streak" ON user_streaks
    FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_all_streaks" ON user_streaks
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update streak when activity is recorded
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_date DATE;
    current_streak_val INTEGER;
BEGIN
    -- Get current streak data
    SELECT last_activity_date, current_streak 
    INTO last_date, current_streak_val
    FROM user_streaks 
    WHERE user_id = NEW.user_id;

    -- If no streak record exists, create one
    IF NOT FOUND THEN
        INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_active_days)
        VALUES (NEW.user_id, 1, 1, NEW.activity_date, 1);
        RETURN NEW;
    END IF;

    -- If activity is for today
    IF NEW.activity_date = CURRENT_DATE THEN
        -- Check if last activity was yesterday
        IF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
            -- Continue streak
            UPDATE user_streaks 
            SET current_streak = current_streak + 1,
                longest_streak = GREATEST(longest_streak, current_streak + 1),
                last_activity_date = NEW.activity_date,
                total_active_days = total_active_days + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF last_date = CURRENT_DATE THEN
            -- Same day, just update timestamp
            UPDATE user_streaks 
            SET updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSE
            -- Streak broken, restart
            UPDATE user_streaks 
            SET current_streak = 1,
                last_activity_date = NEW.activity_date,
                total_active_days = total_active_days + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update streaks
CREATE TRIGGER trigger_update_streak
    AFTER INSERT OR UPDATE ON user_activity
    FOR EACH ROW
    EXECUTE FUNCTION update_user_streak();

-- ============================================
-- NOTES
-- ============================================
-- Run this after the main schema.sql
-- Streaks auto-update when activity is recorded
-- Use INSERT INTO user_activity for daily check-ins
