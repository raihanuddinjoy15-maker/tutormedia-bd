-- ============================================================================
-- TutorMedia BD — Production additions
-- Run this AFTER schema.sql (or after appending it) in the Supabase SQL editor.
-- Adds: auto-profile-on-signup, notifications, payments, verification
-- documents, conversation membership, and Row Level Security policies.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Auto-create a `profiles` row whenever someone signs up via Supabase Auth.
--    This replaces doing the insert from client code (safer + can't be skipped).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'guardian'),
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- profiles.id should reference auth.users, not have its own default.
-- (If profiles.id already has `default gen_random_uuid()` from schema.sql,
--  drop the default so it always matches the auth user's id.)
alter table profiles alter column id drop default;

-- ---------------------------------------------------------------------------
-- 2. Conversation membership (who is in a conversation) — schema.sql's
--    `conversations` table has no participants list yet.
-- ---------------------------------------------------------------------------
create table if not exists conversation_members (
  conversation_id uuid references conversations(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  primary key (conversation_id, profile_id)
);

-- ---------------------------------------------------------------------------
-- 3. Notifications
-- ---------------------------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  type text not null, -- 'application' | 'message' | 'verification' | 'payment' | 'system'
  title text not null,
  body text,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 4. Verification documents (manual admin review — see NID note in README)
-- ---------------------------------------------------------------------------
create table if not exists verification_documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  doc_type text not null, -- 'nid' | 'student_id' | 'university_cert'
  file_path text not null, -- path in the `verification-docs` storage bucket
  status text default 'pending', -- 'pending' | 'approved' | 'rejected'
  reviewer_note text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- 5. Payments (SSLCommerz)
-- ---------------------------------------------------------------------------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  tuition_id uuid references tuition_posts(id) on delete set null,
  purpose text not null, -- 'featured_listing' | 'tutor_subscription' | 'unlock_contact'
  amount_bdt integer not null,
  currency text default 'BDT',
  gateway text default 'sslcommerz',
  gateway_tran_id text unique,
  status text default 'initiated', -- 'initiated' | 'paid' | 'failed' | 'cancelled'
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table tutor_profiles enable row level security;
alter table tuition_posts enable row level security;
alter table applications enable row level security;
alter table reviews enable row level security;
alter table conversations enable row level security;
alter table conversation_members enable row level security;
alter table messages enable row level security;
alter table reports enable row level security;
alter table notifications enable row level security;
alter table verification_documents enable row level security;
alter table payments enable row level security;

-- profiles: publicly readable (needed to browse tutors), only owner can edit
create policy "profiles are viewable by everyone" on profiles for select using (true);
create policy "users can update own profile" on profiles for update using (auth.uid() = id);

-- tutor_profiles: public read, owner write
create policy "tutor profiles are viewable by everyone" on tutor_profiles for select using (true);
create policy "tutor manages own profile" on tutor_profiles for insert with check (auth.uid() = profile_id);
create policy "tutor updates own profile" on tutor_profiles for update using (auth.uid() = profile_id);

-- tuition_posts: public read, guardian owns their post
create policy "tuition posts are viewable by everyone" on tuition_posts for select using (true);
create policy "guardian creates own post" on tuition_posts for insert with check (auth.uid() = guardian_id);
create policy "guardian updates own post" on tuition_posts for update using (auth.uid() = guardian_id);

-- applications: tutor sees/creates own, guardian sees applications on their posts
create policy "tutor sees own applications" on applications for select using (
  auth.uid() = tutor_id or auth.uid() in (select guardian_id from tuition_posts where id = tuition_id)
);
create policy "tutor applies to tuition" on applications for insert with check (auth.uid() = tutor_id);

-- reviews: public read, reviewer writes own
create policy "reviews are viewable by everyone" on reviews for select using (true);
create policy "reviewer creates own review" on reviews for insert with check (auth.uid() = reviewer_id);

-- conversations / messages: only members can read or write
create policy "members read own conversations" on conversation_members for select using (auth.uid() = profile_id);
create policy "members read conversation messages" on messages for select using (
  conversation_id in (select conversation_id from conversation_members where profile_id = auth.uid())
);
create policy "members send messages" on messages for insert with check (
  auth.uid() = sender_id and
  conversation_id in (select conversation_id from conversation_members where profile_id = auth.uid())
);

-- reports: reporter can create, only admin can read (handled via service role in admin routes)
create policy "user creates report" on reports for insert with check (auth.uid() = reporter_id);

-- notifications: owner only
create policy "user reads own notifications" on notifications for select using (auth.uid() = profile_id);
create policy "user updates own notifications" on notifications for update using (auth.uid() = profile_id);

-- verification_documents: owner uploads/reads own; admin review happens via service role
create policy "user reads own verification docs" on verification_documents for select using (auth.uid() = profile_id);
create policy "user uploads own verification docs" on verification_documents for insert with check (auth.uid() = profile_id);

-- payments: owner only
create policy "user reads own payments" on payments for select using (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- 7. Storage bucket for verification documents (run once)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('verification-docs', 'verification-docs', false)
on conflict (id) do nothing;

create policy "user uploads own verification file"
  on storage.objects for insert
  with check (bucket_id = 'verification-docs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "user reads own verification file"
  on storage.objects for select
  using (bucket_id = 'verification-docs' and auth.uid()::text = (storage.foldername(name))[1]);
