-- Compression failures: one row per batch run that stopped due to an error.
create table if not exists compression_failures (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  error_message text not null,
  file_index integer not null,
  total_files integer not null,
  phase text
);

-- Optional: RLS. Uncomment if you use RLS on compression_metrics.
-- alter table compression_failures enable row level security;
-- create policy "Allow anon insert" on compression_failures for insert to anon with check (true);

create index if not exists idx_compression_failures_created_at on compression_failures (created_at desc);
create index if not exists idx_compression_failures_phase on compression_failures (phase);
