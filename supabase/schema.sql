-- Run in Supabase SQL editor. Requires Supabase Auth (auth.users).

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  plan text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  onboarding_completed boolean default false,
  timezone text default 'Asia/Kolkata',
  created_at timestamptz default now()
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles (id) on delete cascade,
  title text not null,
  raw_input text not null,
  domain text,
  emotional_state_before text,
  outcome text,
  outcome_rating int,
  created_at timestamptz default now(),
  decision_date date
);

create table if not exists public.autopsies (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid references public.decisions (id) on delete cascade,
  user_id uuid references public.user_profiles (id),
  root_cause text,
  cognitive_biases jsonb,
  emotional_triggers jsonb,
  life_patterns jsonb,
  nervous_system_state text,
  alternate_outcome_probability double precision,
  wait_72hr_probability double precision,
  estimated_cost_inr numeric,
  estimated_cost_context text,
  immediate_actions jsonb,
  pattern_break_strategy text,
  full_report text,
  model_version text,
  tokens_used int,
  prompt_version text,
  schema_version text,
  request_id text,
  latency_ms int,
  created_at timestamptz default now()
);

create table if not exists public.cognitive_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles (id) unique,
  top_biases jsonb,
  trigger_map jsonb,
  domain_scores jsonb,
  worst_decision_times jsonb,
  high_risk_states jsonb,
  decision_quality_trend jsonb,
  total_decisions_analyzed int,
  estimated_total_cost_inr numeric,
  profile_confidence double precision,
  narrative_summary text,
  last_updated timestamptz default now()
);

create table if not exists public.pattern_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles (id),
  alert_type text,
  message text,
  decision_id uuid references public.decisions (id),
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.user_profiles enable row level security;
alter table public.decisions enable row level security;
alter table public.autopsies enable row level security;
alter table public.cognitive_profiles enable row level security;
alter table public.pattern_alerts enable row level security;

create policy "Users read own profile" on public.user_profiles
  for select using (auth.uid() = id);
create policy "Users insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.user_profiles
  for update using (auth.uid() = id);

create policy "Users CRUD own decisions" on public.decisions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users CRUD own autopsies" on public.autopsies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users CRUD own cognitive profile" on public.cognitive_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users CRUD own alerts" on public.pattern_alerts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
