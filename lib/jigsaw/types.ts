export const PUZZLE_ROWS = 3;
export const PUZZLE_COLS = 4;
export const EXPECTED_PIECE_COUNT = PUZZLE_ROWS * PUZZLE_COLS;

export const PLACEHOLDER_PALETTE = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
];

export type GameStatus = 'playing' | 'won';

export interface Piece {
  id: string;
  correctIndex: number;
  imageUrl: string | null;
}

export interface PieceError {
  pieceId: string;
  slotIndex: number;
}

export interface GameState {
  pieces: Piece[];
  board: (string | null)[];
  selectedPieceId: string | null;
  lastError: PieceError | null;
  status: GameStatus;
}
