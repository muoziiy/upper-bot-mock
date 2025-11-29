create extension if not exists "uuid-ossp";

create table if not exists broadcast_history (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references auth.users(id),
  message text not null,
  target_type text not null,
  target_id text,
  recipient_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table broadcast_history enable row level security;

drop policy if exists "Admins can view broadcast history" on broadcast_history;
create policy "Admins can view broadcast history"
  on broadcast_history for select
  using (auth.uid() in (select id from users where role in ('admin', 'super_admin')));

drop policy if exists "Admins can insert broadcast history" on broadcast_history;
create policy "Admins can insert broadcast history"
  on broadcast_history for insert
  with check (auth.uid() in (select id from users where role in ('admin', 'super_admin')));
