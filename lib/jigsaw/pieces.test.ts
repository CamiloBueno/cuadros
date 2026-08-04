import { describe, expect, it } from 'vitest';
import { getPlaceholderColor, hasExpectedPieceCount, mapRowsToPieces, shufflePieces } from './pieces';
import { EXPECTED_PIECE_COUNT } from './types';
import type { JigsawPieceRow } from '@/lib/supabase/types';

function makeRows(count: number): JigsawPieceRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `piece-${i}`,
    mission_id: 'mission-7',
    image_url: null,
    order_index: i,
  }));
}

describe('mapRowsToPieces', () => {
  it('maps Supabase rows to domain pieces', () => {
    const rows = makeRows(2);
    expect(mapRowsToPieces(rows)).toEqual([
      { id: 'piece-0', correctIndex: 0, imageUrl: null },
      { id: 'piece-1', correctIndex: 1, imageUrl: null },
    ]);
  });
});

describe('hasExpectedPieceCount', () => {
  it('is true when the row count matches PUZZLE_ROWS * PUZZLE_COLS', () => {
    expect(hasExpectedPieceCount(makeRows(EXPECTED_PIECE_COUNT))).toBe(true);
  });

  it('is false when there are too few or too many rows', () => {
    expect(hasExpectedPieceCount(makeRows(EXPECTED_PIECE_COUNT - 1))).toBe(false);
    expect(hasExpectedPieceCount(makeRows(EXPECTED_PIECE_COUNT + 1))).toBe(false);
  });
});

describe('shufflePieces', () => {
  it('preserves every piece without duplicating or losing any', () => {
    const pieces = mapRowsToPieces(makeRows(EXPECTED_PIECE_COUNT));
    const shuffled = shufflePieces(pieces);
    expect(shuffled).toHaveLength(pieces.length);
    expect([...shuffled].sort((a, b) => a.correctIndex - b.correctIndex)).toEqual(pieces);
  });

  it('does not mutate the original array', () => {
    const pieces = mapRowsToPieces(makeRows(EXPECTED_PIECE_COUNT));
    const original = [...pieces];
    shufflePieces(pieces);
    expect(pieces).toEqual(original);
  });
});

describe('getPlaceholderColor', () => {
  it('is deterministic for a given index', () => {
    expect(getPlaceholderColor(0)).toBe(getPlaceholderColor(0));
  });

  it('wraps around the palette for indices beyond its length', () => {
    expect(getPlaceholderColor(0)).toBe(getPlaceholderColor(12));
  });
});
