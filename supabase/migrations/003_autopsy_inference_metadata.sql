-- Adds inference traceability fields for AI quality audits and rollback analysis.

alter table public.autopsies
  add column if not exists prompt_version text,
  add column if not exists schema_version text,
  add column if not exists request_id text,
  add column if not exists latency_ms int;

create index if not exists autopsies_request_id_idx
  on public.autopsies (request_id);
