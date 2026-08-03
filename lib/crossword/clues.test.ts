import { describe, it, expect } from 'vitest';
import { mapRowsToClues, hasExpectedClueCount, EXPECTED_CLUE_COUNT } from './clues';
import type { CrosswordClueRow } from '@/lib/supabase/types';

function row(overrides: Partial<CrosswordClueRow>): CrosswordClueRow {
  return {
    id: 'row-1',
    mission_id: 'mission-4',
    clue_number: 1,
    direction: 'across',
    clue_text: 'clue text',
    answer: 'cat',
    start_row: 0,
    start_col: 0,
    ...overrides,
  };
}

describe('mapRowsToClues', () => {
  it('maps snake_case DB rows to camelCase ClueDefinition, normalizing the answer', () => {
    const rows = [row({ answer: 'café' })];
    const [clue] = mapRowsToClues(rows);

    expect(clue).toEqual({
      id: 'row-1',
      number: 1,
      direction: 'across',
      clueText: 'clue text',
      answer: 'CAFE',
      startRow: 0,
      startCol: 0,
    });
  });
});

describe('hasExpectedClueCount', () => {
  it(`is true only with exactly ${EXPECTED_CLUE_COUNT} rows`, () => {
    const rows = Array.from({ length: EXPECTED_CLUE_COUNT }, (_, i) => row({ id: `row-${i}` }));
    expect(hasExpectedClueCount(rows)).toBe(true);
  });

  it('is false with too few or too many rows', () => {
    expect(hasExpectedClueCount([])).toBe(false);
    const tooMany = Array.from({ length: EXPECTED_CLUE_COUNT + 1 }, (_, i) => row({ id: `row-${i}` }));
    expect(hasExpectedClueCount(tooMany)).toBe(false);
  });
});
