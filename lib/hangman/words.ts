import type { HangmanWordRow } from '@/lib/supabase/types';

export const MIN_EXPECTED_WORD_COUNT = 1;

export function mapRowsToWords(rows: HangmanWordRow[]): string[] {
  return rows.map((row) => row.word.toUpperCase());
}

export function hasWords(rows: HangmanWordRow[]): boolean {
  return rows.length >= MIN_EXPECTED_WORD_COUNT;
}

export function pickRandomWord(words: string[]): string {
  const index = Math.floor(Math.random() * words.length);
  return words[index];
}
