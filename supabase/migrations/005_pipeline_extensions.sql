-- Pipeline: feedback loop, decision embeddings, profile enrichment fields.

create table if not exists public.autopsy_feedback (
  id uuid primary key default gen_random_uuid(),
  autopsy_id uuid not null references public.autopsies (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  helpful boolean not null,
  tags text[] default '{}',
  comment text,
  created_at timestamptz default now(),
  unique (autopsy_id, user_id)
);

create table if not exists public.decision_embeddings (
  decision_id uuid primary key references public.decisions (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  embedding jsonb not null,
  model_version text,
  updated_at timestamptz default now()
);

create index if not exists idx_decision_embeddings_user
  on public.decision_embeddings (user_id);

alter table public.cognitive_profiles
  add column if not exists history_summary text;

alter table public.cognitive_profiles
  add column if not exists pipeline_version text;

alter table public.autopsies
  add column if not exists pipeline_version text;

alter table public.autopsies
  add column if not exists retrieval_method text;

alter table public.autopsy_feedback enable row level security;
alter table public.decision_embeddings enable row level security;

create policy "Users CRUD own autopsy feedback" on public.autopsy_feedback
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users read own decision embeddings" on public.decision_embeddings
  for select using (auth.uid() = user_id);

create policy "Users insert own decision embeddings" on public.decision_embeddings
  for insert with check (auth.uid() = user_id);

create policy "Users update own decision embeddings" on public.decision_embeddings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
