-- ============================================
-- STUDENT PAYMENT OVERHAUL MIGRATION
-- ============================================

-- 1. Add payment_day to USERS table (Global for student)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS payment_day INTEGER DEFAULT 1 CHECK (payment_day BETWEEN 1 AND 31);

-- 2. Remove payment_model from GROUPS (if exists)
-- Note: We might want to keep it for legacy or if different groups HAVE to have different models, 
-- but user specifically asked to remove it.
ALTER TABLE groups 
DROP COLUMN IF EXISTS payment_model;

-- 3. Remove payment_day from GROUP_MEMBERS
ALTER TABLE group_members
DROP COLUMN IF EXISTS payment_day;

-- 4. Drop existing function first (since we're changing the return type)
DROP FUNCTION IF EXISTS get_overdue_students(DATE);

-- 5. Create updated function for student-centric payment tracking
CREATE OR REPLACE FUNCTION get_overdue_students(target_date DATE)
RETURNS TABLE (
    student_id UUID,
    total_amount_due DECIMAL,
    groups_count INTEGER,
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as student_id,
        SUM(g.price) as total_amount_due,
        COUNT(g.id)::INTEGER as groups_count,
        'monthly_payment_overdue' as reason
    FROM users u
    JOIN group_members gm ON u.id = gm.student_id
    JOIN groups g ON gm.group_id = g.id
    WHERE u.role = 'student'
    -- Check if today is past the student's payment day
    AND u.payment_day <= EXTRACT(DAY FROM target_date)
    -- Check if they haven't paid for this month
    -- Logic: Sum of payments for this month < Sum of group prices
    AND (
        SELECT COALESCE(SUM(pr.amount), 0)
        FROM payment_records pr
        WHERE pr.student_id = u.id
        AND pr.month = EXTRACT(MONTH FROM target_date)::INTEGER
        AND pr.year = EXTRACT(YEAR FROM target_date)::INTEGER
        AND pr.status = 'completed' -- Only count completed payments
    ) < (
        -- Calculate total price of all groups the student is in
        SELECT COALESCE(SUM(g2.price), 0)
        FROM group_members gm2
        JOIN groups g2 ON gm2.group_id = g2.id
        WHERE gm2.student_id = u.id
    )
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql;
