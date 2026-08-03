insert into memory_pairs (mission_id, image_url, label_text, order_index) values
  ('mission-3', 'https://placehold.co/300x300?text=Biblioteca', 'Biblioteca', 1),
  ('mission-3', 'https://placehold.co/300x300?text=Gimnasio', 'Gimnasio', 2),
  ('mission-3', 'https://placehold.co/300x300?text=Maqueta', 'Maqueta sede Ciudad Jardín', 3),
  ('mission-3', 'https://placehold.co/300x300?text=Oktoberfest', 'Oktoberfest', 4),
  ('mission-3', 'https://placehold.co/300x300?text=Nikolaus', 'Nikolaus', 5),
  ('mission-3', 'https://placehold.co/300x300?text=Comunion', 'Primera comunión', 6),
  ('mission-3', 'https://placehold.co/300x300?text=Kinder', 'Kinder', 7),
  ('mission-3', 'https://placehold.co/300x300?text=Banda', 'Banda de guerra', 8),
  ('mission-3', 'https://placehold.co/300x300?text=Flauta', 'Grupo de flauta', 9);

insert into crossword_clues (mission_id, clue_number, direction, clue_text, answer, start_row, start_col) values
  ('mission-4', 1, 'down', 'Personaje principal de la celebración alemana de Pascua.', 'OSTERHASE', 0, 3),
  ('mission-4', 2, 'down', 'Obispo reconocido por su generosidad y celebrado cada diciembre.', 'NIKOLAUS', 3, 7),
  ('mission-4', 3, 'down', 'Publicación que recibíamos al finalizar cada año escolar con fotografías y recuerdos.', 'ANUARIO', 2, 5),
  ('mission-4', 4, 'across', 'Tradicional fiesta de faroles que se celebra en Kinder.', 'LATERNENFEST', 3, 0),
  -- ACEDOSA is intentionally the reverse of ASODECA — the clue explicitly says
  -- "(Invertido)". This is NOT a typo; do not "correct" it to ASODECA.
  ('mission-4', 5, 'across', 'Asociación que reúne hoy a los egresados del Colegio Alemán de Cali. (Invertido)', 'ACEDOSA', 8, 1),
  ('mission-4', 6, 'across', 'Festival folclórico y de la cerveza más grande del mundo.', 'OKTOBERFEST', 0, 3),
  ('mission-4', 7, 'down', 'Instrumento musical que nunca faltaba en el salón de música.', 'PIANO', 1, 1);

insert into hangman_words (mission_id, word, order_index) values
  ('mission-6', 'FREUNDSCHAFT', 1),
  ('mission-6', 'ERINNERUNG', 2),
  ('mission-6', 'GENERATION', 3),
  ('mission-6', 'SCHULE', 4),
  ('mission-6', 'LEHRER', 5),
  ('mission-6', 'HEIMAT', 6),
  ('mission-6', 'ZUSAMMENHALT', 7),
  ('mission-6', 'WIEDERSEHEN', 8),
  ('mission-6', 'MAUER', 9),
  ('mission-6', 'EINHEIT', 10),
  ('mission-6', 'ZUKUNFT', 11),
  ('mission-6', 'VERGANGENHEIT', 12);
