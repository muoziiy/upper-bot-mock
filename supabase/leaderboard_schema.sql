-- ============================================
-- PHASE 3: LEADERBOARDS - DATABASE
-- ============================================

-- Leaderboard entries (materialized view for performance)
CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'global', 'weekly', 'monthly', 'class'
    score INTEGER DEFAULT 0,
    rank INTEGER,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE, -- for class leaderboards
    period TEXT, -- '2025-W47', '2025-11', 'all-time'
    metadata JSONB, -- {tests_taken: 10, avg_score: 95, streak: 7}
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category, period, group_id)
);

CREATE INDEX idx_leaderboard_category_period ON leaderboard_entries(category, period, rank);
CREATE INDEX idx_leaderboard_user ON leaderboard_entries(user_id);
CREATE INDEX idx_leaderboard_group ON leaderboard_entries(group_id) WHERE group_id IS NOT NULL;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Everyone can read leaderboards
CREATE POLICY "public_read_leaderboard" ON leaderboard_entries
    FOR SELECT 
    USING (true);

-- Only admins can modify
CREATE POLICY "admin_all_leaderboard" ON leaderboard_entries
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate user score
CREATE OR REPLACE FUNCTION calculate_user_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER;
    v_streak_bonus INTEGER;
    v_achievement_points INTEGER;
BEGIN
    -- Base score: average score * tests completed
    SELECT 
        COALESCE(
            (AVG((score::float / total_points::float) * 100) * COUNT(*))::INTEGER,
            0
        )
    INTO v_score
    FROM exam_results
    WHERE student_id = p_user_id AND is_completed = true;

    -- Streak bonus (10 points per day)
    SELECT COALESCE(current_streak * 10, 0)
    INTO v_streak_bonus
    FROM user_streaks
    WHERE user_id = p_user_id;

    -- Achievement points
    SELECT COALESCE(SUM(a.points), 0)
    INTO v_achievement_points
    FROM user_achievements ua
    JOIN achievements a ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id;

    RETURN v_score + v_streak_bonus + v_achievement_points;
END;
$$ LANGUAGE plpgsql;

-- Function to update global leaderboard
CREATE OR REPLACE FUNCTION update_global_leaderboard()
RETURNS VOID AS $$
BEGIN
    -- Clear old global entries
    DELETE FROM leaderboard_entries 
    WHERE category = 'global' AND period = 'all-time';

    -- Insert new rankings
    WITH user_scores AS (
        SELECT 
            u.id as user_id,
            calculate_user_score(u.id) as score
        FROM users u
        WHERE u.role = 'student'
    ),
    ranked_users AS (
        SELECT 
            user_id,
            score,
            ROW_NUMBER() OVER (ORDER BY score DESC) as rank
        FROM user_scores
        WHERE score > 0
    )
    INSERT INTO leaderboard_entries (user_id, category, score, rank, period, metadata)
    SELECT 
        user_id,
        'global',
        score,
        rank,
        'all-time',
        jsonb_build_object(
            'last_updated', NOW()
        )
    FROM ranked_users;
END;
$$ LANGUAGE plpgsql;

-- Function to update weekly leaderboard
CREATE OR REPLACE FUNCTION update_weekly_leaderboard()
RETURNS VOID AS $$
DECLARE
    v_week TEXT;
BEGIN
    -- Get current week (ISO format)
    v_week := TO_CHAR(CURRENT_DATE, 'IYYY-IW');

    -- Clear old weekly entries for this week
    DELETE FROM leaderboard_entries 
    WHERE category = 'weekly' AND period = v_week;

    -- Calculate scores based on this week's activity
    WITH weekly_scores AS (
        SELECT 
            er.student_id as user_id,
            (AVG((er.score::float / er.total_points::float) * 100) * COUNT(*))::INTEGER as score
        FROM exam_results er
        WHERE er.is_completed = true
        AND er.submitted_at >= DATE_TRUNC('week', CURRENT_DATE)
        GROUP BY er.student_id
    ),
    ranked_users AS (
        SELECT 
            user_id,
            score,
            ROW_NUMBER() OVER (ORDER BY score DESC) as rank
        FROM weekly_scores
        WHERE score > 0
    )
    INSERT INTO leaderboard_entries (user_id, category, score, rank, period, metadata)
    SELECT 
        user_id,
        'weekly',
        score,
        rank,
        v_week,
        jsonb_build_object(
            'week', v_week,
            'last_updated', NOW()
        )
    FROM ranked_users;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SCHEDULED UPDATES (Call from cron or backend)
-- ============================================
-- Call update_global_leaderboard() daily
-- Call update_weekly_leaderboard() daily
-- Can be triggered via pg_cron or from backend scheduler

-- ============================================
-- NOTES
-- ============================================
-- Run this after achievements_schema.sql
-- Leaderboards are rebuilt periodically for performance
-- Frontend fetches from leaderboard_entries table
