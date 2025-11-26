-- Part 1: Update user_role enum
-- Run this script FIRST and separately.
-- This cannot be run in the same transaction as the usage of the new enum value.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
