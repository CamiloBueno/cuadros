import type { MemoryPairRow } from '@/lib/supabase/types';
import type { MemoryPair } from './types';

export const EXPECTED_PAIR_COUNT = 9;

export function mapRowsToPairs(rows: MemoryPairRow[]): MemoryPair[] {
  return rows.map((row) => ({
    id: row.id,
    imageUrl: row.image_url,
    labelText: row.label_text,
  }));
}

export function hasExpectedPairCount(rows: MemoryPairRow[]): boolean {
  return rows.length === EXPECTED_PAIR_COUNT;
}
