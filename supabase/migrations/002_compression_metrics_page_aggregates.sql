-- Optional page-level aggregates (spec 2.3). Null when not collected.
alter table compression_metrics
  add column if not exists total_render_ms double precision,
  add column if not exists total_compress_images_ms double precision,
  add column if not exists sum_input_image_bytes bigint,
  add column if not exists sum_compressed_image_bytes bigint;
