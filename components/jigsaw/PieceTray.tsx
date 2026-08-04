'use client';

import { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Piece } from '@/lib/jigsaw/types';
import { PuzzlePiece } from './PuzzlePiece';

const VISIBLE_COUNT = 3;

interface PieceTrayProps {
  pieces: Piece[];
  selectedPieceId: string | null;
  errorPieceId: string | null;
  onSelectPiece: (pieceId: string) => void;
}

export function PieceTray({ pieces, selectedPieceId, errorPieceId, onSelectPiece }: PieceTrayProps) {
  const [startIndex, setStartIndex] = useState(0);

  const maxStartIndex = Math.max(pieces.length - VISIBLE_COUNT, 0);

  useEffect(() => {
    setStartIndex((current) => Math.min(current, maxStartIndex));
  }, [maxStartIndex]);

  const visiblePieces = pieces.slice(startIndex, startIndex + VISIBLE_COUNT);

  return (
    <div className="flex w-full max-w-[220px] flex-col items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Ver piezas anteriores"
        disabled={startIndex === 0}
        onClick={() => setStartIndex((current) => Math.max(current - 1, 0))}
      >
        <ChevronUp className="size-4" />
      </Button>

      <div className="flex w-full flex-col gap-3">
        {visiblePieces.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">¡Sin piezas pendientes!</p>
        )}
        {visiblePieces.map((piece) => (
          <PuzzlePiece
            key={piece.id}
            piece={piece}
            selected={selectedPieceId === piece.id}
            error={errorPieceId === piece.id}
            onClick={() => onSelectPiece(piece.id)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Ver más piezas"
        disabled={startIndex >= maxStartIndex}
        onClick={() => setStartIndex((current) => Math.min(current + 1, maxStartIndex))}
      >
        <ChevronDown className="size-4" />
      </Button>
    </div>
  );
}
