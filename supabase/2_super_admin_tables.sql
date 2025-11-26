-- Part 2: Super Admin Tables and Policies
-- Run this script AFTER running 1_update_enum.sql

-- 1. Add student_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id TEXT UNIQUE;

-- 2. Function to generate unique 6-digit student_id
CREATE OR REPLACE FUNCTION generate_unique_student_id()
RETURNS TRIGGER AS $$
DECLARE
    new_id TEXT;
    done BOOLEAN DEFAULT FALSE;
BEGIN
    IF NEW.student_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    WHILE NOT done LOOP
        -- Generate random 6-digit number
        new_id := floor(random() * (999999 - 100000 + 1) + 100000)::TEXT;
        
        -- Check if it exists
        PERFORM 1 FROM users WHERE student_id = new_id;
        IF NOT FOUND THEN
            done := TRUE;
        END IF;
    END LOOP;

    NEW.student_id := new_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger to assign student_id on insert
DROP TRIGGER IF EXISTS trigger_assign_student_id ON users;
CREATE TRIGGER trigger_assign_student_id
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION generate_unique_student_id();

-- 4. Admin Requests Table
CREATE TABLE IF NOT EXISTS admin_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'declined'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status);

-- 5. RLS Policies

-- Enable RLS
ALTER TABLE admin_requests ENABLE ROW LEVEL SECURITY;

-- Policies for admin_requests
-- Users can create a request
CREATE POLICY "users_create_requests" ON admin_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own requests
CREATE POLICY "users_view_own_requests" ON admin_requests FOR SELECT USING (auth.uid() = user_id);

-- Super Admins can view all requests
CREATE POLICY "super_admins_view_all_requests" ON admin_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);

-- Super Admins can update requests
CREATE POLICY "super_admins_update_requests" ON admin_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);

-- Update Users policies to allow Super Admin to see everything
CREATE POLICY "super_admins_manage_users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);
