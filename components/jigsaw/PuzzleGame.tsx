'use client';

import { useEffect, useMemo, useReducer, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { MissionShell } from '@/components/misiones/MissionShell';
import { Button } from '@/components/ui/button';
import { createInitialState, gameReducer } from '@/lib/jigsaw/reducer';
import { shufflePieces } from '@/lib/jigsaw/pieces';
import type { Piece } from '@/lib/jigsaw/types';
import { PuzzleBoard } from './PuzzleBoard';
import { PieceTray } from './PieceTray';
import { ResultModal } from './ResultModal';

interface PuzzleGameProps {
  pieces: Piece[];
}

export function PuzzleGame({ pieces }: PuzzleGameProps) {
  const [state, dispatch] = useReducer(gameReducer, pieces, createInitialState);
  const [modalDismissed, setModalDismissed] = useState(false);

  useEffect(() => {
    dispatch({ type: 'RESET', pieces: shufflePieces(pieces) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allPieceById = useMemo(() => new Map(pieces.map((piece) => [piece.id, piece])), [pieces]);

  function handleSelectPiece(pieceId: string) {
    dispatch({ type: 'SELECT_PIECE', pieceId });
  }

  function handleSlotClick(slotIndex: number) {
    dispatch({ type: 'PLACE_ATTEMPT', slotIndex });
  }

  function handleRetry() {
    dispatch({ type: 'RESET', pieces: shufflePieces(pieces) });
    setModalDismissed(false);
  }

  return (
    <MissionShell
      missionNumber={7}
      missionName="Puzzle"
      title="Completa el rompecabezas"
      description="Descubre lo que oculta nuestro puzzle."
      backHref="/"
      footerActions={
        <Button variant="outline" onClick={handleRetry}>
          <RotateCcw className="size-4" />
          Reiniciar
        </Button>
      }
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex-1">
          <PuzzleBoard
            board={state.board}
            pieceById={allPieceById}
            lastError={state.lastError}
            onSlotClick={handleSlotClick}
          />
        </div>
        <PieceTray
          pieces={state.pieces}
          selectedPieceId={state.selectedPieceId}
          errorPieceId={state.lastError?.pieceId ?? null}
          onSelectPiece={handleSelectPiece}
        />
      </div>

      {state.status === 'won' && (
        <ResultModal open={!modalDismissed} onRetry={handleRetry} onClose={() => setModalDismissed(true)} />
      )}
    </MissionShell>
  );
}
