-- Compression metrics: one row per PDF compression run.
-- Summary columns for querying; iterations stored as JSONB.
create table if not exists compression_metrics (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  initial_size_bytes bigint not null,
  target_size_bytes bigint not null,
  final_size_bytes bigint not null,
  size_ratio double precision not null,
  target_achieved boolean not null,
  total_duration_ms double precision not null,
  page_count integer not null,
  iterations_used integer not null,
  final_aggression double precision not null,
  optimizer_options jsonb not null,
  iterations jsonb not null,
  total_render_ms double precision,
  total_compress_images_ms double precision,
  sum_input_image_bytes bigint,
  sum_compressed_image_bytes bigint
);

-- Optional: RLS. Enable and add policies if you want per-user or anon insert-only.
-- alter table compression_metrics enable row level security;
-- create policy "Allow anon insert" on compression_metrics for insert to anon with check (true);

create index if not exists idx_compression_metrics_created_at on compression_metrics (created_at desc);
create index if not exists idx_compression_metrics_target_achieved on compression_metrics (target_achieved);
create index if not exists idx_compression_metrics_page_count on compression_metrics (page_count);
