'use client';

import { PUZZLE_COLS, type Piece, type PieceError } from '@/lib/jigsaw/types';
import { PuzzlePiece } from './PuzzlePiece';

interface PuzzleBoardProps {
  board: (string | null)[];
  pieceById: Map<string, Piece>;
  lastError: PieceError | null;
  onSlotClick: (slotIndex: number) => void;
}

export function PuzzleBoard({ board, pieceById, lastError, onSlotClick }: PuzzleBoardProps) {
  return (
    <div
      data-testid="puzzle-board"
      className="grid gap-1 rounded-lg border-4 border-blue-900 bg-amber-50 p-2"
      style={{ gridTemplateColumns: `repeat(${PUZZLE_COLS}, minmax(0, 1fr))` }}
    >
      {board.map((pieceId, slotIndex) => {
        const piece = pieceId ? pieceById.get(pieceId) : undefined;
        const isError = lastError?.slotIndex === slotIndex;

        if (piece) {
          return (
            <div key={slotIndex} data-testid={`puzzle-slot-${slotIndex}`} className="aspect-square rounded-md">
              <PuzzlePiece piece={piece} />
            </div>
          );
        }

        return (
          <button
            key={slotIndex}
            type="button"
            data-testid={`puzzle-slot-${slotIndex}`}
            onClick={() => onSlotClick(slotIndex)}
            className={`aspect-square rounded-md border-2 border-dashed border-blue-900/30 transition-colors ${
              isError ? 'animate-[shake_0.5s_ease-in-out] border-solid border-red-600 bg-red-50' : ''
            }`}
          />
        );
      })}
    </div>
  );
}
