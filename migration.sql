-- Add reminder settings columns to education_center_settings table
ALTER TABLE education_center_settings 
ADD COLUMN IF NOT EXISTS enable_payment_reminders BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS enable_class_reminders BOOLEAN DEFAULT TRUE;

-- Add description column to teacher_payments table
ALTER TABLE teacher_payments
ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================
-- EXAM SYSTEM UPDATES
-- ============================================

-- Add media support to questions
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT; -- 'image', 'audio', 'video'

-- Add AI tracking to exams
ALTER TABLE exams
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;

-- Create exam_submissions table
CREATE TABLE IF NOT EXISTS exam_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    score DECIMAL(5, 2), -- Percentage or points
    answers JSONB DEFAULT '{}'::jsonb, -- Stores question_id: answer pairs
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'submitted', 'graded'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for exam_submissions
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;

-- Students can view and create their own submissions
CREATE POLICY "Students can view own submissions" ON exam_submissions
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create own submissions" ON exam_submissions
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own submissions" ON exam_submissions
    FOR UPDATE USING (auth.uid() = student_id);

-- Teachers/Admins can view all submissions for their exams
CREATE POLICY "Teachers can view submissions for their exams" ON exam_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exams 
            WHERE exams.id = exam_submissions.exam_id 
            AND (exams.teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')))
        )
    );
