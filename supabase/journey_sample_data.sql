-- ============================================
-- COMPREHENSIVE FAKE DATA FOR JOURNEY FEATURE
-- Run this AFTER journey_schema.sql
-- ============================================

-- ============================================
-- CURRICULUM DATA (ALL LEVELS)
-- ============================================

INSERT INTO curriculum (level, name, description, order_index) VALUES 
    -- BEGINNER
    ('beginner', 'Beginner Module 1: Getting Started', 'Introduction to English - greetings, basic phrases, and alphabet', 1),
    ('beginner', 'Beginner Module 2: Daily Life', 'Vocabulary for everyday activities and routines', 2),
    ('beginner', 'Beginner Module 3: Family & Friends', 'Talking about people, relationships, and descriptions', 3),
    ('beginner', 'Beginner Module 4: Food & Drinks', 'Restaurant vocabulary and food preferences', 4),
    
    -- ELEMENTARY
    ('elementary', 'Elementary Module 1: Present Tense Mastery', 'Understanding and using present tenses effectively', 1),
    ('elementary', 'Elementary Module 2: Shopping & Money', 'Practical vocabulary for shopping and financial conversations', 2),
    ('elementary', 'Elementary Module 3: Hobbies & Interests', 'Discussing activities and personal interests', 3),
    ('elementary', 'Elementary Module 4: Telling Time & Schedules', 'Time expressions and daily schedules', 4),
    
    -- PRE-INTERMEDIATE
    ('pre_intermediate', 'Pre-Intermediate Module 1: Past Tense Stories', 'Narrating events in the past with detail', 1),
    ('pre_intermediate', 'Pre-Intermediate Module 2: Travel & Directions', 'Vocabulary and phrases for traveling and navigating', 2),
    ('pre_intermediate', 'Pre-Intermediate Module 3: Health & Wellness', 'Medical vocabulary and health discussions', 3),
    ('pre_intermediate', 'Pre-Intermediate Module 4: Making Plans', 'Future tenses and planning conversations', 4),
    
    -- INTERMEDIATE
    ('intermediate', 'Intermediate Module 1: Expressing Opinions', 'Advanced communication and debate skills', 1),
    ('intermediate', 'Intermediate Module 2: Business English Basics', 'Professional communication fundamentals', 2),
    ('intermediate', 'Intermediate Module 3: Technology & Media', 'Modern tech vocabulary and social media', 3),
    ('intermediate', 'Intermediate Module 4: Cultural Awareness', 'Cross-cultural communication skills', 4),
    
    -- UPPER-INTERMEDIATE
    ('upper_intermediate', 'Upper-Intermediate Module 1: Advanced Grammar', 'Complex sentence structures and conditionals', 1),
    ('upper_intermediate', 'Upper-Intermediate Module 2: Presentations & Public Speaking', 'Professional presentation skills', 2),
    ('upper_intermediate', 'Upper-Intermediate Module 3: Academic Writing', 'Essays, reports, and formal writing', 3),
    ('upper_intermediate', 'Upper-Intermediate Module 4: Idioms & Expressions', 'Natural English expressions and idioms', 4),
    
    -- ADVANCED
    ('advanced', 'Advanced Module 1: Nuanced Communication', 'Subtle meanings and advanced vocabulary', 1),
    ('advanced', 'Advanced Module 2: Critical Thinking', 'Analysis, argumentation, and logic in English', 2),
    ('advanced', 'Advanced Module 3: Literature & Poetry', 'Understanding complex texts and literary devices', 3),
    ('advanced', 'Advanced Module 4: Professional English', 'Industry-specific vocabulary and communication', 4),
    
    -- IELTS
    ('ielts', 'IELTS Module 1: Listening Skills', 'IELTS listening test strategies and practice', 1),
    ('ielts', 'IELTS Module 2: Reading Comprehension', 'Academic and general reading techniques', 2),
    ('ielts', 'IELTS Module 3: Writing Tasks', 'Task 1 and Task 2 writing strategies', 3),
    ('ielts', 'IELTS Module 4: Speaking Test Prep', 'Speaking test format and practice', 4)
ON CONFLICT DO NOTHING;

-- ============================================
-- LESSONS DATA (SAMPLE FOR EACH MODULE)
-- ============================================

-- BEGINNER LESSONS
INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Greetings & Introductions', 'Learn how to greet people and introduce yourself', 
    'Master basic greetings: Hello, Hi, Good morning, Good afternoon, Good evening. Practice introducing yourself with "My name is..." and "I am from..."',
    30, ARRAY['greetings', 'introductions', 'vocabulary'], 1
FROM curriculum c WHERE c.name LIKE '%Getting Started%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 2: Numbers & Alphabet', 'Master English numbers and the alphabet', 
    'Learn to count from 1-100, spell words using the alphabet, and practice phone numbers.',
    45, ARRAY['numbers', 'alphabet', 'pronunciation'], 2
FROM curriculum c WHERE c.name LIKE '%Getting Started%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 3: Basic Questions', 'Learn to ask and answer simple questions', 
    'Question words: Who, What, Where, When, Why, How. Practice forming and answering basic questions.',
    40, ARRAY['questions', 'grammar', 'conversation'], 3
FROM curriculum c WHERE c.name LIKE '%Getting Started%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 4: Colors & Objects', 'Describe things using colors and basic adjectives', 
    'Learn color names and how to describe objects. Practice: "This is a red car" and "That is a big house".',
    35, ARRAY['vocabulary', 'adjectives', 'colors'], 4
FROM curriculum c WHERE c.name LIKE '%Getting Started%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Daily Routines', 'Vocabulary for describing your daily activities', 
    'Learn verbs for daily actions: wake up, brush teeth, eat breakfast, go to work, etc.',
    35, ARRAY['daily-routines', 'verbs', 'vocabulary'], 1
FROM curriculum c WHERE c.name LIKE '%Daily Life%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 2: In the House', 'Rooms, furniture, and household items', 
    'Vocabulary for different rooms (bedroom, kitchen, bathroom) and common furniture.',
    40, ARRAY['vocabulary', 'house', 'furniture'], 2
FROM curriculum c WHERE c.name LIKE '%Daily Life%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 3: Weather Talk', 'Describing weather conditions', 
    'Learn to talk about weather: sunny, rainy, cloudy, hot, cold, windy.',
    30, ARRAY['weather', 'vocabulary', 'conversation'], 3
FROM curriculum c WHERE c.name LIKE '%Daily Life%';

-- ELEMENTARY LESSONS
INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Simple Present', 'Master the simple present tense', 
    'Learn to use simple present for habits, facts, and routines. Practice with daily activities.',
    45, ARRAY['grammar', 'present-tense', 'structure'], 1
FROM curriculum c WHERE c.name LIKE '%Present Tense Mastery%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 2: Present Continuous', 'Actions happening now', 
    'Use present continuous for current actions. Practice: "I am studying" vs "I study".',
    50, ARRAY['grammar', 'present-continuous', 'verbs'], 2
FROM curriculum c WHERE c.name LIKE '%Present Tense Mastery%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 3: Shopping Vocabulary', 'Essential words for shopping', 
    'Learn to shop: prices, sizes, colors. Practice conversations in stores.',
    40, ARRAY['shopping', 'vocabulary', 'conversation'], 1
FROM curriculum c WHERE c.name LIKE '%Shopping & Money%';

-- PRE-INTERMEDIATE LESSONS
INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Simple Past', 'Narrate past events and experiences', 
    'Master regular and irregular past tense verbs. Tell stories about your past.',
    50, ARRAY['grammar', 'past-tense', 'storytelling'], 1
FROM curriculum c WHERE c.name LIKE '%Past Tense Stories%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 2: Past Continuous', 'Actions in progress in the past', 
    'Use past continuous for background actions. "I was walking when it started raining".',
    45, ARRAY['grammar', 'past-continuous', 'narrative'], 2
FROM curriculum c WHERE c.name LIKE '%Past Tense Stories%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Asking for Directions', 'Navigate cities and give directions', 
    'Learn to ask for and give directions using prepositions and landmarks.',
    40, ARRAY['directions', 'prepositions', 'conversation'], 1
FROM curriculum c WHERE c.name LIKE '%Travel & Directions%';

-- INTERMEDIATE LESSONS
INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Expressing Agreement & Disagreement', 'Politely share your opinions', 
    'Learn phrases for agreeing and disagreeing diplomatically in discussions.',
    45, ARRAY['opinions', 'conversation', 'debate'], 1
FROM curriculum c WHERE c.name LIKE '%Expressing Opinions%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 2: Email Writing', 'Professional email communication', 
    'Write formal and informal emails. Learn proper greetings, structure, and sign-offs.',
    50, ARRAY['writing', 'business', 'email'], 1
FROM curriculum c WHERE c.name LIKE '%Business English Basics%';

-- UPPER-INTERMEDIATE LESSONS
INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Conditionals (All Types)', 'Master zero, first, second, third conditionals', 
    'Learn all conditional structures and when to use each type in conversation.',
    60, ARRAY['grammar', 'conditionals', 'advanced'], 1
FROM curriculum c WHERE c.name LIKE '%Advanced Grammar%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Presentation Structure', 'Organize and deliver effective presentations', 
    'Learn to structure presentations with introduction, body, conclusion. Practice delivery.',
    55, ARRAY['presentations', 'public-speaking', 'business'], 1
FROM curriculum c WHERE c.name LIKE '%Presentations%';

-- ADVANCED LESSONS
INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Collocations & Fixed Phrases', 'Natural word combinations', 
    'Master common collocations to sound more natural and fluent in English.',
    50, ARRAY['vocabulary', 'collocations', 'fluency'], 1
FROM curriculum c WHERE c.name LIKE '%Nuanced Communication%';

-- IELTS LESSONS
INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: IELTS Listening Part 1 & 2', 'Practice social and everyday contexts', 
    'Master note-taking and prediction skills for IELTS listening sections 1 and 2.',
    60, ARRAY['IELTS', 'listening', 'test-strategy'], 1
FROM curriculum c WHERE c.name LIKE '%Listening Skills%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Academic Reading Skills', 'Skimming, scanning, and detailed reading', 
    'Learn essential reading strategies for IELTS Academic reading passages.',
    65, ARRAY['IELTS', 'reading', 'academic'], 1
FROM curriculum c WHERE c.name LIKE '%Reading Comprehension%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: IELTS Writing Task 1', 'Describing graphs, charts, and diagrams', 
    'Master the Task 1 structure and essential vocabulary for data description.',
    70, ARRAY['IELTS', 'writing', 'task-1'], 1
FROM curriculum c WHERE c.name LIKE '%Writing Tasks%';

INSERT INTO lessons (curriculum_id, title, description, content, duration_minutes, topics, order_index)
SELECT c.id, 'Lesson 1: Speaking Part 1 - Introduction', 'Practice personal questions and answers', 
    'Prepare for IELTS Speaking Part 1 with common topics and answer techniques.',
    50, ARRAY['IELTS', 'speaking', 'interview'], 1
FROM curriculum c WHERE c.name LIKE '%Speaking Test Prep%';

-- ============================================
-- SAMPLE EXAMS (CREATE BASE EXAMS FIRST)
-- ============================================

-- Create sample exams
INSERT INTO exams (title, description, is_published, start_time, end_time, duration_minutes)
VALUES 
    ('Beginner Level Assessment', 'Test your basic English skills - reading, writing, listening', true, 
     NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '2 hours', 90),
    
    ('Elementary Proficiency Test', 'Evaluate your elementary English competency', true, 
     NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '90 minutes', 90),
    
    ('Pre-Intermediate Exam', 'Mid-level English assessment covering all skills', true, 
     NOW() + INTERVAL '15 days', NOW() + INTERVAL '15 days' + INTERVAL '2 hours', 120),
    
    ('Intermediate Business English Test', 'Professional English communication assessment', true, 
     NOW() + INTERVAL '20 days', NOW() + INTERVAL '20 days' + INTERVAL '2 hours', 120),
    
    ('IELTS Practice Test (Full)', 'Complete IELTS practice exam - all sections', true, 
     NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days' + INTERVAL '3 hours', 180),
    
    ('Grammar Challenge Quiz', 'Quick grammar assessment for all levels', true, 
     NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour', 60)
ON CONFLICT DO NOTHING;

-- ============================================
-- EXAM SCHEDULES (ONLINE & OFFLINE)
-- ============================================

-- Create exam schedules
INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, location, max_participants, current_participants)
SELECT id, 'offline', NOW() + INTERVAL '5 days', 'Room 101, Main Building, 3rd Floor', 25, 18
FROM exams WHERE title = 'Beginner Level Assessment';

INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, meeting_link, max_participants, current_participants)
SELECT id, 'online', NOW() + INTERVAL '10 days', 'https://zoom.us/j/elementary-exam-2024', 50, 32
FROM exams WHERE title = 'Elementary Proficiency Test';

INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, location, max_participants, current_participants)
SELECT id, 'offline', NOW() + INTERVAL '15 days', 'Computer Lab A, 2nd Floor', 30, 15
FROM exams WHERE title = 'Pre-Intermediate Exam';

INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, meeting_link, max_participants, current_participants)
SELECT id, 'online', NOW() + INTERVAL '20 days', 'https://meet.google.com/intermediate-business', 40, 28
FROM exams WHERE title = 'Intermediate Business English Test';

INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, location, max_participants, current_participants)
SELECT id, 'offline', NOW() + INTERVAL '30 days', 'IELTS Testing Center, Downtown Campus', 20, 19
FROM exams WHERE title = 'IELTS Practice Test (Full)';

INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, meeting_link, max_participants, current_participants)
SELECT id, 'online', NOW() + INTERVAL '3 days', 'https://teams.microsoft.com/grammar-quiz', 100, 45
FROM exams WHERE title = 'Grammar Challenge Quiz';

-- Additional exam for tomorrow (urgent)
INSERT INTO exam_schedule (exam_id, exam_type, scheduled_date, location, max_participants, current_participants)
SELECT id, 'offline', NOW() + INTERVAL '1 day', 'Room 205, Language Center', 25, 24
FROM exams WHERE title = 'Beginner Level Assessment';

-- ============================================
-- NOTES FOR TESTING
-- ============================================

-- To set a user's current level and progress:
-- UPDATE user_current_level 
-- SET current_level = 'beginner', progress_percentage = 35 
-- WHERE user_id = 'YOUR_USER_UUID';

-- To mark some lessons as completed for a user:
-- INSERT INTO user_lesson_progress (user_id, lesson_id, is_completed, completion_date, time_spent_minutes)
-- SELECT 'YOUR_USER_UUID', id, true, NOW() - INTERVAL '2 days', 30
-- FROM lessons 
-- WHERE curriculum_id IN (SELECT id FROM curriculum WHERE level = 'beginner')
-- LIMIT 3;
