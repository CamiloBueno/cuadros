create table if not exists memory_pairs (
  id uuid primary key default gen_random_uuid(),
  mission_id text not null,
  image_url text not null,
  label_text text not null,
  order_index int not null default 0
);

alter table memory_pairs enable row level security;

create policy "Public read access to memory_pairs"
  on memory_pairs
  for select
  using (true);
