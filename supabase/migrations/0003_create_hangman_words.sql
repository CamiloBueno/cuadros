create table if not exists hangman_words (
  id uuid primary key default gen_random_uuid(),
  mission_id text not null,
  word text not null,
  order_index int not null default 0
);

alter table hangman_words enable row level security;

create policy "Public read access to hangman_words"
  on hangman_words
  for select
  using (true);

grant select on hangman_words to anon, authenticated;
