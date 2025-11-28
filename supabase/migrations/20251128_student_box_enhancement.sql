-- ============================================
-- STUDENT BOX ENHANCEMENT MIGRATION
-- Add missing fields for enhanced payment tracking
-- ============================================

-- 1. Add group_id to payment_records for per-group payment tracking
ALTER TABLE payment_records
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE CASCADE;

-- 2. Add lessons_attended to payment_records for lesson-based payment calculation
ALTER TABLE payment_records
ADD COLUMN IF NOT EXISTS lessons_attended INTEGER DEFAULT 12 CHECK (lessons_attended > 0);

-- 3. Create index for performance on payment queries by group
CREATE INDEX IF NOT EXISTS idx_payment_records_group_id ON payment_records(group_id);

-- 4. Create index for student-group-month lookup (common query pattern)
CREATE INDEX IF NOT EXISTS idx_payment_records_student_month ON payment_records(student_id, month, year);
