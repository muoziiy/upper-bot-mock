-- ============================================
-- PHASE 2: ACHIEVEMENTS & BADGES - DATABASE
-- ============================================

-- Achievement definitions (predefined list)
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- 'first_test', 'perfect_score', 'week_streak'
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- emoji or icon name
    category TEXT, -- 'streak', 'performance', 'milestones', 'social'
    requirement JSONB NOT NULL, -- {type: 'streak', value: 7}
    points INTEGER DEFAULT 10,
    rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);

-- User unlocked achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notified BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Everyone can read achievement definitions
CREATE POLICY "public_read_achievements" ON achievements
    FOR SELECT 
    USING (true);

-- Users can read their own unlocked achievements
CREATE POLICY "users_read_own_achievements" ON user_achievements
    FOR SELECT 
    USING (user_id = auth.uid());

-- Only backend can insert achievements (service role)
CREATE POLICY "service_insert_achievements" ON user_achievements
    FOR INSERT 
    WITH CHECK (true);

-- Admins can do everything
CREATE POLICY "admin_all_achievements" ON achievements
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "admin_all_user_achievements" ON user_achievements
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- SEED DATA - Initial Achievements
-- ============================================

INSERT INTO achievements (slug, name, description, icon, category, requirement, points, rarity) VALUES
-- Streak Achievements
('first_day', 'First Steps', 'Completed your first day of learning', '🎯', 'streak', '{"type": "streak", "value": 1}', 5, 'common'),
('week_warrior', 'Week Warrior', 'Maintained a 7-day streak', '🔥', 'streak', '{"type": "streak", "value": 7}', 15, 'rare'),
('month_master', 'Month Master', '30-day streak champion', '🏆', 'streak', '{"type": "streak", "value": 30}', 50, 'epic'),
('century_scholar', 'Century Scholar', '100-day streak legend', '👑', 'streak', '{"type": "streak", "value": 100}', 100, 'legendary'),

-- Performance Achievements
('first_test', 'Test Taker', 'Completed your first test', '📝', 'milestones', '{"type": "tests_completed", "value": 1}', 5, 'common'),
('perfect_score', 'Perfectionist', 'Scored 100% on a test', '💯', 'performance', '{"type": "perfect_score"}', 25, 'rare'),
('ace_student', 'Ace Student', 'Averaged 90%+ over 10 tests', '🌟', 'performance', '{"type": "high_average", "tests": 10, "score": 90}', 40, 'epic'),
('speed_demon', 'Speed Demon', 'Completed a test in under 5 minutes', '⚡', 'performance', '{"type": "fast_completion", "minutes": 5}', 20, 'rare'),

-- Milestone Achievements
('ten_tests', 'Getting Started', 'Completed 10 tests', '📚', 'milestones', '{"type": "tests_completed", "value": 10}', 10, 'common'),
('fifty_tests', 'Dedicated Learner', 'Completed 50 tests', '📖', 'milestones', '{"type": "tests_completed", "value": 50}', 30, 'rare'),
('hundred_tests', 'Test Master', 'Completed 100 tests', '🎓', 'milestones', '{"type": "tests_completed", "value": 100}', 75, 'epic'),

-- Social Achievements
('early_bird', 'Early Bird', 'Completed a test before 8 AM', '🌅', 'social', '{"type": "time_of_day", "before": 8}', 15, 'rare'),
('night_owl', 'Night Owl', 'Completed a test after 10 PM', '🦉', 'social', '{"type": "time_of_day", "after": 22}', 15, 'rare')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id UUID)
RETURNS TABLE(achievement_id UUID, achievement_name TEXT) AS $$
DECLARE
    v_achievement RECORD;
    v_user_stats RECORD;
    v_unlocked BOOLEAN;
BEGIN
    -- Get user stats
    SELECT 
        COALESCE(current_streak, 0) as streak,
        COALESCE((SELECT COUNT(*) FROM exam_results WHERE student_id = p_user_id AND is_completed = true), 0) as total_tests,
        COALESCE((SELECT AVG((score::float / total_points::float) * 100) FROM exam_results WHERE student_id = p_user_id AND is_completed = true), 0) as avg_score
    INTO v_user_stats
    FROM user_streaks
    WHERE user_id = p_user_id;

    -- Loop through all achievements
    FOR v_achievement IN SELECT * FROM achievements LOOP
        -- Check if already unlocked
        SELECT EXISTS(
            SELECT 1 FROM user_achievements 
            WHERE user_id = p_user_id AND achievement_id = v_achievement.id
        ) INTO v_unlocked;

        IF NOT v_unlocked THEN
            -- Check streak achievements
            IF v_achievement.requirement->>'type' = 'streak' THEN
                IF v_user_stats.streak >= (v_achievement.requirement->>'value')::int THEN
                    INSERT INTO user_achievements (user_id, achievement_id)
                    VALUES (p_user_id, v_achievement.id);
                    RETURN QUERY SELECT v_achievement.id, v_achievement.name;
                END IF;
            END IF;

            -- Check tests completed
            IF v_achievement.requirement->>'type' = 'tests_completed' THEN
                IF v_user_stats.total_tests >= (v_achievement.requirement->>'value')::int THEN
                    INSERT INTO user_achievements (user_id, achievement_id)
                    VALUES (p_user_id, v_achievement.id);
                    RETURN QUERY SELECT v_achievement.id, v_achievement.name;
                END IF;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NOTES
-- ============================================
-- Run this after streaks_schema.sql
-- Call check_and_unlock_achievements(user_id) after completing tests or updating streaks
-- Frontend can poll /api/students/achievements to show unlocked badges
