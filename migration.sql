-- Add reminder settings columns to education_center_settings table
ALTER TABLE education_center_settings 
ADD COLUMN IF NOT EXISTS enable_payment_reminders BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS enable_class_reminders BOOLEAN DEFAULT TRUE;
