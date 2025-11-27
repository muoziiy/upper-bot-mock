-- ============================================
-- PAYMENT RECORDS TABLE ENHANCEMENT
-- ============================================
-- This migration enhances the payment_records table with additional fields
-- for subject tracking, payment method, and notes

-- Add new columns to payment_records table
ALTER TABLE payment_records 
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('cash', 'card')),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_payment_records_subject ON payment_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_method ON payment_records(payment_method);

-- Update RLS policies for payment_records

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admins_manage_payments" ON payment_records;
DROP POLICY IF EXISTS "admins_view_all_payments" ON payment_records;
DROP POLICY IF EXISTS "teachers_view_student_payments" ON payment_records;

-- Admins can manage (SELECT, INSERT, UPDATE, DELETE) all payment records
CREATE POLICY "admins_manage_payments" ON payment_records FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Students can only view their own payment records (already exists but ensuring it's present)
-- CREATE POLICY "students_view_own_payments" ON payment_records FOR SELECT
-- USING (student_id = auth.uid());
-- (This policy should already exist in complete_schema.sql)

-- Optional: Teachers can view payments for students in their groups
CREATE POLICY "teachers_view_student_payments" ON payment_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    JOIN groups g ON gm.group_id = g.id
    WHERE gm.student_id = payment_records.student_id
    AND g.teacher_id = auth.uid()
  )
);

-- ============================================
-- HELPER FUNCTION: Calculate payment status for a student
-- ============================================
-- This function helps determine if a student is paid/unpaid/overdue

CREATE OR REPLACE FUNCTION get_student_payment_status(
    student_uuid UUID,
    target_month INTEGER,
    target_year INTEGER
)
RETURNS TEXT AS $$
DECLARE
    payment_count INTEGER;
    overdue_count INTEGER;
BEGIN
    -- Check if there are any paid payments for the given month/year
    SELECT COUNT(*) INTO payment_count
    FROM payment_records
    WHERE student_id = student_uuid
    AND month = target_month
    AND year = target_year
    AND status = 'paid';

    -- If there are paid payments, return 'paid'
    IF payment_count > 0 THEN
        RETURN 'paid';
    END IF;

    -- Check if there are any unpaid/pending payments that are overdue
    SELECT COUNT(*) INTO overdue_count
    FROM payment_records
    WHERE student_id = student_uuid
    AND month = target_month
    AND year = target_year
    AND status IN ('unpaid', 'pending')
    AND payment_date < CURRENT_DATE;

    -- If there are overdue payments, return 'overdue'
    IF overdue_count > 0 THEN
        RETURN 'overdue';
    END IF;

    -- Otherwise, return 'unpaid'
    RETURN 'unpaid';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- REMINDER
-- ============================================
-- After running this migration, test the following:
-- 1. Add a payment with subject_id and payment_method
-- 2. Verify RLS policies work correctly for admin/student/teacher roles
-- 3. Test get_student_payment_status function
-- 4. Ensure indexes improve query performance
