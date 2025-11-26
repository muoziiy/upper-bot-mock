-- ============================================
-- PARENT ROLE MIGRATION
-- ============================================
-- This migration adds parent role support to the education center bot
-- Run this script in your Supabase SQL Editor

-- ============================================
-- 1. ALTER ENUM TO ADD PARENT ROLE
-- ============================================
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'parent';

-- ============================================
-- 2. PARENT-CHILDREN RELATIONSHIP TABLE
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
-- 3. PAYMENT RECORDS TABLE
-- ============================================
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

-- ============================================
-- 4. ATTENDANCE RECORDS TABLE
-- ============================================
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
-- 5. RLS POLICIES FOR PARENT ROLE
-- ============================================

-- Enable RLS on new tables
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Parent-Children Policies
DROP POLICY IF EXISTS "parents_view_their_children" ON parent_children;
CREATE POLICY "parents_view_their_children" ON parent_children 
    FOR SELECT USING (parent_id = auth.uid());

-- Payment Records Policies
DROP POLICY IF EXISTS "parents_view_children_payments" ON payment_records;
CREATE POLICY "parents_view_children_payments" ON payment_records 
    FOR SELECT USING (
        student_id IN (
            SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "students_view_own_payments" ON payment_records;
CREATE POLICY "students_view_own_payments" ON payment_records 
    FOR SELECT USING (student_id = auth.uid());

-- Attendance Records Policies
DROP POLICY IF EXISTS "parents_view_children_attendance" ON attendance_records;
CREATE POLICY "parents_view_children_attendance" ON attendance_records 
    FOR SELECT USING (
        student_id IN (
            SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "students_view_own_attendance" ON attendance_records;
CREATE POLICY "students_view_own_attendance" ON attendance_records 
    FOR SELECT USING (student_id = auth.uid());

-- Allow parents to view their children's exam results
DROP POLICY IF EXISTS "parents_view_children_exam_results" ON exam_results;
CREATE POLICY "parents_view_children_exam_results" ON exam_results 
    FOR SELECT USING (
        student_id IN (
            SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
        )
    );

-- Allow parents to view their children's user data
DROP POLICY IF EXISTS "parents_view_children_users" ON users;
CREATE POLICY "parents_view_children_users" ON users 
    FOR SELECT USING (
        id IN (
            SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
        ) OR id = auth.uid()
    );

-- Allow parents to view their children's lesson progress
DROP POLICY IF EXISTS "parents_view_children_progress" ON user_lesson_progress;
CREATE POLICY "parents_view_children_progress" ON user_lesson_progress 
    FOR SELECT USING (
        user_id IN (
            SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
        )
    );

-- Allow parents to view their children's current level
DROP POLICY IF EXISTS "parents_view_children_level" ON user_current_level;
CREATE POLICY "parents_view_children_level" ON user_current_level 
    FOR SELECT USING (
        user_id IN (
            SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
        )
    );

-- Allow parents to view groups their children are in
DROP POLICY IF EXISTS "parents_view_children_groups" ON groups;
CREATE POLICY "parents_view_children_groups" ON groups 
    FOR SELECT USING (
        id IN (
            SELECT group_id FROM group_members 
            WHERE student_id IN (
                SELECT student_id FROM parent_children WHERE parent_id = auth.uid()
            )
        )
    );

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Update updated_at for payment_records
DROP TRIGGER IF EXISTS update_payment_records_updated_at ON payment_records;
CREATE TRIGGER update_payment_records_updated_at 
    BEFORE UPDATE ON payment_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at for attendance_records
DROP TRIGGER IF EXISTS update_attendance_records_updated_at ON attendance_records;
CREATE TRIGGER update_attendance_records_updated_at 
    BEFORE UPDATE ON attendance_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
