-- Backfill student_id for existing users
-- Run this script to assign unique IDs to users who don't have one yet.

DO $$
DECLARE
    r RECORD;
    new_id TEXT;
    done BOOLEAN;
BEGIN
    FOR r IN SELECT id FROM users WHERE student_id IS NULL LOOP
        done := FALSE;
        WHILE NOT done LOOP
            -- Generate random 6-digit number
            new_id := floor(random() * (999999 - 100000 + 1) + 100000)::TEXT;
            
            -- Check if it exists
            PERFORM 1 FROM users WHERE student_id = new_id;
            IF NOT FOUND THEN
                done := TRUE;
            END IF;
        END LOOP;

        -- Update user
        UPDATE users SET student_id = new_id WHERE id = r.id;
    END LOOP;
END $$;
