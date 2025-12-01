-- ============================================
-- PHASE 2: OFFLINE EXAMS & ASSIGNMENTS
-- ============================================

-- 1. Update Exams Table
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'online', -- 'online' or 'offline'
ADD COLUMN IF NOT EXISTS location TEXT; -- For offline exams

-- 2. Create Exam Assignments (Schedule)
-- Links an exam to a group for a specific time
CREATE TABLE IF NOT EXISTS exam_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add Indexes
CREATE INDEX IF NOT EXISTS idx_exam_assignments_exam ON exam_assignments(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_assignments_group ON exam_assignments(group_id);
CREATE INDEX IF NOT EXISTS idx_exam_assignments_date ON exam_assignments(scheduled_date);
