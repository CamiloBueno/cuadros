import { shuffleArray } from '@/lib/game/shuffle';
import type { JigsawPieceRow } from '@/lib/supabase/types';
import { EXPECTED_PIECE_COUNT, PLACEHOLDER_PALETTE, type Piece } from './types';

export function mapRowsToPieces(rows: JigsawPieceRow[]): Piece[] {
  return rows.map((row) => ({
    id: row.id,
    correctIndex: row.order_index,
    imageUrl: row.image_url,
  }));
}

export function hasExpectedPieceCount(rows: JigsawPieceRow[]): boolean {
  return rows.length === EXPECTED_PIECE_COUNT;
}

export function shufflePieces(pieces: Piece[]): Piece[] {
  return shuffleArray(pieces);
}

export function getPlaceholderColor(correctIndex: number): string {
  return PLACEHOLDER_PALETTE[correctIndex % PLACEHOLDER_PALETTE.length];
}
