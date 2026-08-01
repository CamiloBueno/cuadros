'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { MemoryCard } from './MemoryCard';
import { Timer } from './Timer';
import { ResultModal } from './ResultModal';
import { buildDeck } from '@/lib/game/shuffle';
import { createInitialState, gameReducer, TIME_LIMIT_SECONDS } from '@/lib/game/reducer';
import type { MemoryPair } from '@/lib/game/types';

const MISMATCH_DELAY_MS = 800;

interface MemoryGameProps {
  pairs: MemoryPair[];
}

export function MemoryGame({ pairs }: MemoryGameProps) {
  const [state, dispatch] = useReducer(
    gameReducer,
    pairs,
    (initialPairs) => createInitialState(buildDeck(initialPairs), TIME_LIMIT_SECONDS)
  );
  const mismatchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [modalDismissed, setModalDismissed] = useState(false);

  useEffect(() => {
    if (state.status !== 'playing') return;
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(interval);
  }, [state.status]);

  useEffect(() => {
    if (state.flippedIds.length !== 2) return;

    const [firstId, secondId] = state.flippedIds;
    const first = state.cards.find((c) => c.id === firstId);
    const second = state.cards.find((c) => c.id === secondId);
    if (!first || !second || first.pairId === second.pairId) return;

    mismatchTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'RESOLVE_MISMATCH' });
    }, MISMATCH_DELAY_MS);

    return () => {
      if (mismatchTimeoutRef.current) clearTimeout(mismatchTimeoutRef.current);
    };
  }, [state.flippedIds, state.cards]);

  function handleCardClick(cardId: string) {
    if (state.flippedIds.length >= 2) return;
    dispatch({ type: 'FLIP_CARD', cardId });
  }

  function handleRetry() {
    dispatch({ type: 'RESET', cards: buildDeck(pairs), timeLimit: TIME_LIMIT_SECONDS });
    setModalDismissed(false);
  }

  const isResolvingPair = state.flippedIds.length === 2;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Timer secondsLeft={state.timeLeft} />
      </div>
      <div className="grid grid-cols-6 gap-4">
        {state.cards.map((card) => (
          <MemoryCard key={card.id} card={card} onClick={handleCardClick} disabled={isResolvingPair} />
        ))}
      </div>
      {(state.status === 'won' || state.status === 'lost') && (
        <ResultModal
          status={state.status}
          open={(state.status === 'won' || state.status === 'lost') && !modalDismissed}
          onRetry={handleRetry}
          onClose={() => setModalDismissed(true)}
        />
      )}
    </div>
  );
}
