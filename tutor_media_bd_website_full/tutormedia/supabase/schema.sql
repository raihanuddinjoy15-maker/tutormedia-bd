-- TutorMedia BD starter schema
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('tutor','guardian','admin')),
  full_name text not null,
  phone text,
  email text,
  avatar_url text,
  city text,
  area text,
  verified_phone boolean default false,
  verified_identity boolean default false,
  created_at timestamptz default now()
);

create table if not exists tutor_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  university text,
  department text,
  subjects text[],
  classes text[],
  medium text[],
  experience_years numeric default 0,
  expected_fee_min integer,
  expected_fee_max integer,
  availability jsonb,
  bio text,
  rating numeric default 0,
  review_count integer default 0
);

create table if not exists tuition_posts (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid references profiles(id) on delete cascade,
  class_name text,
  subjects text[],
  medium text,
  city text,
  area text,
  budget_min integer,
  budget_max integer,
  days_per_week integer,
  schedule text,
  requirements text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  tuition_id uuid references tuition_posts(id) on delete cascade,
  tutor_id uuid references profiles(id) on delete cascade,
  message text,
  status text default 'pending',
  created_at timestamptz default now(),
  unique(tuition_id, tutor_id)
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid references profiles(id) on delete cascade,
  reviewer_id uuid references profiles(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  review text,
  created_at timestamptz default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  message text not null,
  language text check (language in ('bn','en','banglish')),
  created_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id),
  target_type text,
  target_id uuid,
  reason text,
  status text default 'open',
  created_at timestamptz default now()
);
