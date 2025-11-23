-- ============================================
-- GROUP-BASED JOURNEY FILTERING - SCHEMA UPDATES
-- Run this to add group filtering to journey feature
-- ============================================

-- Add group_id to curriculum table
ALTER TABLE curriculum 
ADD COLUMN group_id UUID REFERENCES groups(id) ON DELETE CASCADE;

-- Add index for group-based queries
CREATE INDEX idx_curriculum_group ON curriculum(group_id);

-- Add group_id to lessons (inherits from curriculum but can override)
ALTER TABLE lessons 
ADD COLUMN group_id UUID REFERENCES groups(id) ON DELETE CASCADE;

CREATE INDEX idx_lessons_group ON lessons(group_id);

-- ============================================
-- UPDATE RLS POLICIES FOR GROUP FILTERING
-- ============================================

-- Drop old curriculum policies
DROP POLICY IF EXISTS "students_view_curriculum" ON curriculum;
DROP POLICY IF EXISTS "teachers_manage_curriculum" ON curriculum;
DROP POLICY IF EXISTS "admin_all_curriculum" ON curriculum;

-- Create new curriculum policies with group filtering
CREATE POLICY "students_view_curriculum" ON curriculum
    FOR SELECT 
    USING (
        is_active = TRUE AND (
            -- Global curriculum (no group assigned)
            group_id IS NULL 
            OR 
            -- Curriculum for user's groups
            EXISTS (
                SELECT 1 FROM group_members 
                WHERE group_id = curriculum.group_id AND student_id = auth.uid()
            )
        )
    );

CREATE POLICY "teachers_manage_curriculum" ON curriculum
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'
        ) AND (
            -- Teachers can manage global curriculum
            group_id IS NULL 
            OR 
            -- Or curriculum for their groups
            EXISTS (
                SELECT 1 FROM groups 
                WHERE id = curriculum.group_id AND teacher_id = auth.uid()
            )
        )
    );

CREATE POLICY "admin_all_curriculum" ON curriculum
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Drop old lessons policies
DROP POLICY IF EXISTS "students_view_lessons" ON lessons;
DROP POLICY IF EXISTS "teachers_manage_lessons" ON lessons;
DROP POLICY IF EXISTS "admin_all_lessons" ON lessons;

-- Create new lessons policies with group filtering
CREATE POLICY "students_view_lessons" ON lessons
    FOR SELECT 
    USING (
        is_active = TRUE AND (
            -- Check lesson's group_id first (if set)
            (
                group_id IS NULL 
                OR 
                EXISTS (
                    SELECT 1 FROM group_members 
                    WHERE group_id = lessons.group_id AND student_id = auth.uid()
                )
            )
            AND
            -- Also check curriculum's group_id
            (
                curriculum_id IS NULL
                OR
                EXISTS (
                    SELECT 1 FROM curriculum c
                    WHERE c.id = lessons.curriculum_id
                    AND (
                        c.group_id IS NULL
                        OR
                        EXISTS (
                            SELECT 1 FROM group_members gm
                            WHERE gm.group_id = c.group_id AND gm.student_id = auth.uid()
                        )
                    )
                )
            )
        )
    );

CREATE POLICY "teachers_manage_lessons" ON lessons
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'
        ) AND (
            -- Lesson's group check
            (
                group_id IS NULL 
                OR 
                EXISTS (
                    SELECT 1 FROM groups 
                    WHERE id = lessons.group_id AND teacher_id = auth.uid()
                )
            )
            AND
            -- Curriculum's group check
            (
                curriculum_id IS NULL
                OR
                EXISTS (
                    SELECT 1 FROM curriculum c
                    JOIN groups g ON g.id = c.group_id
                    WHERE c.id = lessons.curriculum_id
                    AND (c.group_id IS NULL OR g.teacher_id = auth.uid())
                )
            )
        )
    );

CREATE POLICY "admin_all_lessons" ON lessons
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- NOTES
-- ============================================
-- 1. group_id can be NULL for global content (available to all students)
-- 2. Lessons inherit group from curriculum but can override with their own group_id
-- 3. Students only see content from their assigned groups + global content
-- 4. Teachers can only manage content for their groups + global content
-- 5. Admins can manage everything
