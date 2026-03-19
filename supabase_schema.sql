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
