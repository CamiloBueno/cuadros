alter table hangman_words
  add constraint hangman_words_word_az_check
  check (word ~ '^[A-Z]+$');
