import type { CrosswordClueRow } from '@/lib/supabase/types';
import type { ClueDefinition } from './types';
import { normalizeAnswer } from './validation';

export const EXPECTED_CLUE_COUNT = 7;

export function mapRowsToClues(rows: CrosswordClueRow[]): ClueDefinition[] {
  return rows.map((row) => ({
    id: row.id,
    number: row.clue_number,
    direction: row.direction,
    clueText: row.clue_text,
    answer: normalizeAnswer(row.answer),
    startRow: row.start_row,
    startCol: row.start_col,
  }));
}

export function hasExpectedClueCount(rows: CrosswordClueRow[]): boolean {
  return rows.length === EXPECTED_CLUE_COUNT;
}
