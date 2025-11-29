-- Create Enum for Payment Types if not exists
DO $$ BEGIN
    CREATE TYPE public.payment_type AS ENUM ('monthly_fixed', 'monthly_rolling', 'lesson_based');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update groups table
DO $$ BEGIN
    ALTER TABLE public.groups ADD COLUMN payment_type public.payment_type not null default 'monthly_fixed';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Update group_members table
DO $$ BEGIN
    ALTER TABLE public.group_members ADD COLUMN anchor_day integer check (anchor_day >= 1 and anchor_day <= 31);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.group_members ADD COLUMN lessons_remaining integer default 0;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.group_members ADD COLUMN next_due_date date;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.group_members ADD COLUMN last_payment_date date;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add index for performance
create index if not exists idx_group_members_next_due_date on public.group_members(next_due_date);
create index if not exists idx_group_members_lessons_remaining on public.group_members(lessons_remaining);
