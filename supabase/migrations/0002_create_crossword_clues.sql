create table if not exists crossword_clues (
  id uuid primary key default gen_random_uuid(),
  mission_id text not null,
  clue_number int not null,
  direction text not null check (direction in ('across', 'down')),
  clue_text text not null,
  answer text not null,
  start_row int not null,
  start_col int not null
);

alter table crossword_clues enable row level security;

create policy "Public read access to crossword_clues"
  on crossword_clues
  for select
  using (true);

grant select on crossword_clues to anon, authenticated;
