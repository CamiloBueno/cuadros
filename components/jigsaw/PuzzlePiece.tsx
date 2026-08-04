'use client';

import { getPlaceholderColor } from '@/lib/jigsaw/pieces';
import type { Piece } from '@/lib/jigsaw/types';

interface PuzzlePieceProps {
  piece: Piece;
  selected?: boolean;
  error?: boolean;
  onClick?: () => void;
}

export function PuzzlePiece({ piece, selected = false, error = false, onClick }: PuzzlePieceProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      data-testid={`puzzle-piece-${piece.id}`}
      className={`flex aspect-square w-full items-center justify-center rounded-md text-lg font-bold text-white transition-transform ${
        selected ? 'ring-4 ring-blue-900 ring-offset-1' : ''
      } ${error ? 'animate-[shake_0.5s_ease-in-out] ring-4 ring-red-600 ring-offset-1' : ''}`}
      style={{ backgroundColor: getPlaceholderColor(piece.correctIndex) }}
    >
      {piece.correctIndex + 1}
    </button>
  );
}
