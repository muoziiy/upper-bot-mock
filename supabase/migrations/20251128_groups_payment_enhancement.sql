-- ============================================
-- GROUPS & PAYMENTS ENHANCEMENT MIGRATION
-- ============================================

-- 1. Enhance GROUPS table
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{"days": [], "time": ""}', -- e.g. {"days": ["Mon", "Wed"], "time": "14:00"}
ADD COLUMN IF NOT EXISTS payment_model TEXT DEFAULT 'monthly_date' CHECK (payment_model IN ('monthly_date', '12_lessons'));

-- 2. Enhance GROUP_MEMBERS table
ALTER TABLE group_members
ADD COLUMN IF NOT EXISTS payment_day INTEGER DEFAULT 1 CHECK (payment_day BETWEEN 1 AND 31),
ADD COLUMN IF NOT EXISTS lessons_balance INTEGER DEFAULT 0;

-- 3. Enhance PAYMENT_RECORDS table (if not already done)
ALTER TABLE payment_records 
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'click', 'payme')),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_groups_payment_model ON groups(payment_model);
CREATE INDEX IF NOT EXISTS idx_group_members_balance ON group_members(lessons_balance);

-- 4. Helper Function to check overdue payments
CREATE OR REPLACE FUNCTION get_overdue_students(target_date DATE)
RETURNS TABLE (
    student_id UUID,
    group_id UUID,
    amount_due DECIMAL,
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- 1. Monthly Date Model
    SELECT 
        gm.student_id,
        gm.group_id,
        g.price as amount_due,
        'monthly_payment_overdue' as reason
    FROM group_members gm
    JOIN groups g ON gm.group_id = g.id
    WHERE g.payment_model = 'monthly_date'
    AND gm.payment_day <= EXTRACT(DAY FROM target_date)
    AND NOT EXISTS (
        SELECT 1 FROM payment_records pr
        WHERE pr.student_id = gm.student_id
        AND pr.group_id = gm.group_id
        AND pr.month = EXTRACT(MONTH FROM target_date)::INTEGER
        AND pr.year = EXTRACT(YEAR FROM target_date)::INTEGER
        AND pr.status = 'paid'
    )
    
    UNION ALL
    
    -- 2. 12 Lessons Model
    SELECT 
        gm.student_id,
        gm.group_id,
        g.price as amount_due,
        'lessons_balance_empty' as reason
    FROM group_members gm
    JOIN groups g ON gm.group_id = g.id
    WHERE g.payment_model = '12_lessons'
    AND gm.lessons_balance <= 0;
END;
$$ LANGUAGE plpgsql;
