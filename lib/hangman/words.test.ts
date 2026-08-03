import { describe, expect, it, vi } from 'vitest';
import { hasWords, mapRowsToWords, pickRandomWord } from './words';
import type { HangmanWordRow } from '@/lib/supabase/types';

const rows: HangmanWordRow[] = [
  { id: '1', mission_id: 'mission-6', word: 'schule', order_index: 1 },
  { id: '2', mission_id: 'mission-6', word: 'HEIMAT', order_index: 2 },
];

describe('mapRowsToWords', () => {
  it('maps rows to uppercase words', () => {
    expect(mapRowsToWords(rows)).toEqual(['SCHULE', 'HEIMAT']);
  });
});

describe('hasWords', () => {
  it('is true when there is at least one row', () => {
    expect(hasWords(rows)).toBe(true);
  });

  it('is false for an empty array', () => {
    expect(hasWords([])).toBe(false);
  });
});

describe('pickRandomWord', () => {
  it('returns one of the given words', () => {
    const words = ['SCHULE', 'HEIMAT', 'MAUER'];
    const picked = pickRandomWord(words);
    expect(words).toContain(picked);
  });

  it('uses Math.random to select the index', () => {
    const words = ['SCHULE', 'HEIMAT', 'MAUER'];
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(pickRandomWord(words)).toBe('MAUER');
    randomSpy.mockRestore();
  });
});
