-- ============================================
-- PHASE 4: SOCIAL FEATURES - DATABASE
-- ============================================

-- Study Groups
CREATE TABLE study_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_study_groups_active ON study_groups(is_active) WHERE is_active = true;

-- Study Group Members
CREATE TABLE study_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_user ON study_group_members(user_id);
CREATE INDEX idx_group_members_group ON study_group_members(group_id);

-- Challenges (Vocabulary Duels)
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    opponent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type TEXT DEFAULT 'vocabulary', -- 'vocabulary', 'speed', 'accuracy'
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed', 'declined'
    exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
    creator_score INTEGER,
    opponent_score INTEGER,
    winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_challenges_creator ON challenges(creator_id);
CREATE INDEX idx_challenges_opponent ON challenges(opponent_id);
CREATE INDEX idx_challenges_status ON challenges(status);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Users can read all active study groups
CREATE POLICY "read_active_groups" ON study_groups
    FOR SELECT 
    USING (is_active = true);

-- Users can create study groups
CREATE POLICY "users_create_groups" ON study_groups
    FOR INSERT 
    WITH CHECK (created_by = auth.uid());

-- Group creators can update their groups
CREATE POLICY "creators_update_groups" ON study_groups
    FOR UPDATE 
    USING (created_by = auth.uid());

-- Users can read group members
CREATE POLICY "read_group_members" ON study_group_members
    FOR SELECT 
    USING (true);

-- Users can join groups
CREATE POLICY "users_join_groups" ON study_group_members
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- Users can leave groups
CREATE POLICY "users_leave_groups" ON study_group_members
    FOR DELETE 
    USING (user_id = auth.uid());

-- Users can read challenges they're involved in
CREATE POLICY "read_own_challenges" ON challenges
    FOR SELECT 
    USING (creator_id = auth.uid() OR opponent_id = auth.uid());

-- Users can create challenges
CREATE POLICY "create_challenges" ON challenges
    FOR INSERT 
    WITH CHECK (creator_id = auth.uid());

-- Users can update challenges they're involved in
CREATE POLICY "update_own_challenges" ON challenges
    FOR UPDATE 
    USING (creator_id = auth.uid() OR opponent_id = auth.uid());

-- Admins can do everything
CREATE POLICY "admin_all_groups" ON study_groups
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "admin_all_members" ON study_group_members
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "admin_all_challenges" ON challenges
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get group member count
CREATE OR REPLACE FUNCTION get_group_member_count(p_group_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM study_group_members
        WHERE group_id = p_group_id
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NOTES
-- ============================================
-- Run this after leaderboard_schema.sql
-- Challenges can be expanded with different types
-- Frontend should implement real-time updates for challenge status
