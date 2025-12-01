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
