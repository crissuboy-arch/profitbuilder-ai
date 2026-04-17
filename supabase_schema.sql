-- Supabase ProfitBuilder AI Schema

-- 1. Create the extensions
create extension if not exists "uuid-ossp";

-- 2. Create the users table (linked to auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  subscription_tier text default 'free',
  credits integer default 10,
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for users
alter table public.users enable row level security;

-- Users can read their own profile
create policy "Users can view own profile." on public.users
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile." on public.users
  for update using (auth.uid() = id);

-- Users can insert their own profile (needed when trigger is missing)
create policy "Users can insert own profile." on public.users
  for insert with check (auth.uid() = id);

-- 3. Trigger to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, credits, subscription_tier)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 10, 'free');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Create the projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for projects
alter table public.projects enable row level security;

-- Users can view their own projects
create policy "Users can view own projects." on public.projects
  for select using (auth.uid() = user_id);

-- Users can insert their own projects
create policy "Users can insert own projects." on public.projects
  for insert with check (auth.uid() = user_id);

-- Users can update their own projects
create policy "Users can update own projects." on public.projects
  for update using (auth.uid() = user_id);

-- Users can delete their own projects
create policy "Users can delete own projects." on public.projects
  for delete using (auth.uid() = user_id);

-- 5. Create the generations table
create table public.generations (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  module_type text not null, -- e.g., 'product-builder', 'seo-generator'
  input_params jsonb, -- The parameters the user typed in
  output_data jsonb, -- The precise JSON payload the AI returned
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for generations
alter table public.generations enable row level security;

-- Users can view their own generations
create policy "Users can view own generations." on public.generations
  for select using (auth.uid() = user_id);

-- Users can insert their own generations
create policy "Users can insert own generations." on public.generations
  for insert with check (auth.uid() = user_id);

-- Users can update their own generations
create policy "Users can update own generations." on public.generations
  for update using (auth.uid() = user_id);

-- Users can delete their own generations
create policy "Users can delete own generations." on public.generations
  for delete using (auth.uid() = user_id);

-- 6. Playbooks (public shareable playbook reader)
-- References auth.users directly to avoid dependency on public.users trigger
create table public.playbooks (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  title         text not null,
  author        text not null,
  genre         text not null default 'Autoajuda',
  cover_base64  text,
  chapters      jsonb not null default '[]',  -- [{number, title, blocks, imageBase64}]
  created_at    timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.playbooks enable row level security;

-- ANYONE can view a playbook by its ID (public sharing, no login required)
create policy "Public can view playbooks." on public.playbooks
  for select using (true);

-- Only authenticated owner can create
create policy "Users can insert own playbooks." on public.playbooks
  for insert with check (auth.uid() = user_id);

-- Owner can delete their own playbooks
create policy "Users can delete own playbooks." on public.playbooks
  for delete using (auth.uid() = user_id);

-- 7. Books (Meus Livros — saved generated books, text-only, no images)
create table if not exists public.books (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  title         text not null,
  subtitle      text not null default '',
  author        text not null,
  genre         text not null default 'Autoajuda',
  language      text not null default 'Português',
  synopsis      text,
  impact_phrase text,
  conclusion    jsonb,           -- { title, blocks[] }
  chapters      jsonb not null default '[]',  -- BookChapter[] without imageBase64
  page_size     integer default 60,
  created_at    timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.books enable row level security;

create policy "Users can view own books." on public.books
  for select using (auth.uid() = user_id);

create policy "Users can insert own books." on public.books
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own books." on public.books
  for delete using (auth.uid() = user_id);

-- 8. Social Publisher tables

-- Platform connections (Instagram, TikTok) per user
create table public.sp_platforms (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  name             text not null,          -- 'instagram' | 'tiktok'
  display_name     text not null,
  credentials      jsonb not null default '{}',  -- {access_token, ig_user_id / open_id, ...}
  is_active        boolean default false,
  token_expires_at timestamptz,
  created_at       timestamptz default timezone('utc'::text, now()) not null,
  updated_at       timestamptz default timezone('utc'::text, now()) not null,
  unique (user_id, name)
);

alter table public.sp_platforms enable row level security;
create policy "Users manage own sp_platforms." on public.sp_platforms
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Scheduled posts
create table public.sp_posts (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  caption      text not null,
  hashtags     text[] default '{}',
  scheduled_at timestamptz not null,
  status       text not null default 'pending',  -- pending | processing | published | partial | failed | cancelled
  post_type    text not null default 'image',    -- image | video
  media_url    text,
  metadata     jsonb default '{}',
  created_at   timestamptz default timezone('utc'::text, now()) not null,
  updated_at   timestamptz default timezone('utc'::text, now()) not null
);

alter table public.sp_posts enable row level security;
create policy "Users manage own sp_posts." on public.sp_posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Post ↔ Platform join (one row per platform per post)
create table public.sp_post_platforms (
  id            uuid default uuid_generate_v4() primary key,
  post_id       uuid references public.sp_posts(id) on delete cascade not null,
  platform_id   uuid references public.sp_platforms(id) not null,
  status        text not null default 'pending',
  external_id   text,
  external_url  text,
  error_message text,
  published_at  timestamptz,
  created_at    timestamptz default timezone('utc'::text, now()) not null,
  updated_at    timestamptz default timezone('utc'::text, now()) not null,
  unique (post_id, platform_id)
);

alter table public.sp_post_platforms enable row level security;
create policy "Users manage own sp_post_platforms." on public.sp_post_platforms
  for all using (
    exists (select 1 from public.sp_posts where id = post_id and user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.sp_posts where id = post_id and user_id = auth.uid())
  );

-- 9. Saved Ads (for Ads Creator Pro)
create table if not exists public.saved_ads (
  id                uuid default uuid_generate_v4() primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  product_name     text not null,
  framework_id     text not null,
  framework_name   text not null,
  headline         text not null,
  body             text not null,
  cta              text not null,
  visual_concept   text,
  image_prompt     text,
  hook_score       integer default 0,
  clarity_score    integer default 0,
  emotion_score    integer default 0,
  conversion_score integer default 0,
  final_score      integer default 0,
  is_top_ad        boolean default false,
  created_at       timestamptz default timezone('utc'::text, now()) not null
);

alter table public.saved_ads enable row level security;
create policy "Users manage own saved_ads." on public.saved_ads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
