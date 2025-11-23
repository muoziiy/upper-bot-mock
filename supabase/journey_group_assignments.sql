-- ============================================
-- UPDATE SAMPLE DATA WITH GROUP ASSIGNMENTS
-- Run this AFTER journey_group_filtering.sql
-- ============================================

-- First, create some sample groups if they don't exist
INSERT INTO groups (name, teacher_id) 
SELECT 'Beginner Group A', id FROM users WHERE role = 'teacher' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO groups (name, teacher_id) 
SELECT 'Elementary Group B', id FROM users WHERE role = 'teacher' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO groups (name, teacher_id) 
SELECT 'Intermediate Group C', id FROM users WHERE role = 'teacher' LIMIT 1
ON CONFLICT DO NOTHING;

-- Assign curriculum to groups (some remain global with NULL group_id)
-- Beginner curriculum for Beginner Group A
UPDATE curriculum 
SET group_id = (SELECT id FROM groups WHERE name = 'Beginner Group A' LIMIT 1)
WHERE level = 'beginner' AND name LIKE '%Module 1%';

UPDATE curriculum 
SET group_id = (SELECT id FROM groups WHERE name = 'Beginner Group A' LIMIT 1)
WHERE level = 'beginner' AND name LIKE '%Module 2%';

-- Elementary curriculum for Elementary Group B
UPDATE curriculum 
SET group_id = (SELECT id FROM groups WHERE name = 'Elementary Group B' LIMIT 1)
WHERE level = 'elementary' AND name LIKE '%Module 1%';

-- Intermediate curriculum for Intermediate Group C
UPDATE curriculum 
SET group_id = (SELECT id FROM groups WHERE name = 'Intermediate Group C' LIMIT 1)
WHERE level = 'intermediate' AND name LIKE '%Module 1%';

-- Leave remaining curriculum as global (NULL group_id) - available to all students

-- Update some exams to be group-specific
UPDATE exams 
SET group_id = (SELECT id FROM groups WHERE name = 'Beginner Group A' LIMIT 1)
WHERE title = 'Beginner Level Assessment';

UPDATE exams 
SET group_id = (SELECT id FROM groups WHERE name = 'Elementary Group B' LIMIT 1)
WHERE title = 'Elementary Proficiency Test';

UPDATE exams 
SET group_id = (SELECT id FROM groups WHERE name = 'Intermediate Group C' LIMIT 1)
WHERE title = 'Intermediate Business English Test';

-- IELTS and Grammar Quiz remain global (accessible to all)

-- ============================================
-- HELPER QUERIES FOR TESTING
-- ============================================

-- To add a student to a group:
-- INSERT INTO group_members (group_id, student_id)
-- SELECT 
--     (SELECT id FROM groups WHERE name = 'Beginner Group A'),
--     'YOUR_USER_UUID'
-- ON CONFLICT DO NOTHING;

-- To see all groups a user is in:
-- SELECT g.name, g.id 
-- FROM groups g
-- JOIN group_members gm ON gm.group_id = g.id
-- WHERE gm.student_id = 'YOUR_USER_UUID';

-- To see what curriculum a student can access:
-- SELECT c.*, g.name as group_name
-- FROM curriculum c
-- LEFT JOIN groups g ON g.id = c.group_id
-- WHERE c.is_active = TRUE
-- AND (
--     c.group_id IS NULL 
--     OR c.group_id IN (
--         SELECT group_id FROM group_members WHERE student_id = 'YOUR_USER_UUID'
--     )
-- );
