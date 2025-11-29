create extension if not exists "uuid-ossp";

create table if not exists attendance (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references auth.users(id),
  group_id uuid references groups(id),
  date date not null,
  status text check (status in ('present', 'absent', 'late', 'excused')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index
create index if not exists idx_attendance_student_group on attendance(student_id, group_id);
create index if not exists idx_attendance_date on attendance(date);
