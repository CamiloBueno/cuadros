import { describe, it, expect } from 'vitest';
import { mapRowsToPairs, hasExpectedPairCount, EXPECTED_PAIR_COUNT } from './pairs';
import type { MemoryPairRow } from '@/lib/supabase/types';

function makeRow(overrides: Partial<MemoryPairRow> = {}): MemoryPairRow {
  return {
    id: 'row-1',
    mission_id: 'mission-3',
    image_url: 'img.png',
    label_text: 'Biblioteca',
    order_index: 1,
    ...overrides,
  };
}

describe('mapRowsToPairs', () => {
  it('maps DB row fields to MemoryPair fields', () => {
    const rows = [makeRow()];
    const pairs = mapRowsToPairs(rows);
    expect(pairs).toEqual([{ id: 'row-1', imageUrl: 'img.png', labelText: 'Biblioteca' }]);
  });
});

describe('hasExpectedPairCount', () => {
  it('returns true when there are exactly EXPECTED_PAIR_COUNT rows', () => {
    const rows = Array.from({ length: EXPECTED_PAIR_COUNT }, (_, i) => makeRow({ id: `row-${i}` }));
    expect(hasExpectedPairCount(rows)).toBe(true);
  });

  it('returns false when there are fewer rows', () => {
    expect(hasExpectedPairCount([makeRow()])).toBe(false);
  });

  it('returns false for an empty array', () => {
    expect(hasExpectedPairCount([])).toBe(false);
  });
});
