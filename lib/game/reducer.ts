import type { GameState, MemoryCardData } from './types';

export const TIME_LIMIT_SECONDS = 180;

export type GameAction =
  | { type: 'FLIP_CARD'; cardId: string }
  | { type: 'RESOLVE_MISMATCH' }
  | { type: 'TICK' }
  | { type: 'RESET'; cards: MemoryCardData[]; timeLimit?: number };

export function createInitialState(cards: MemoryCardData[], timeLimit: number = TIME_LIMIT_SECONDS): GameState {
  return {
    cards,
    flippedIds: [],
    matchedPairs: 0,
    totalPairs: cards.length / 2,
    timeLeft: timeLimit,
    status: 'playing',
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'FLIP_CARD': {
      if (state.status !== 'playing') return state;
      if (state.flippedIds.length >= 2) return state;

      const card = state.cards.find((c) => c.id === action.cardId);
      if (!card || card.isFlipped || card.isMatched) return state;

      const cards = state.cards.map((c) =>
        c.id === action.cardId ? { ...c, isFlipped: true } : c
      );
      const flippedIds = [...state.flippedIds, action.cardId];

      if (flippedIds.length < 2) {
        return { ...state, cards, flippedIds };
      }

      const [firstId, secondId] = flippedIds;
      const first = cards.find((c) => c.id === firstId)!;
      const second = cards.find((c) => c.id === secondId)!;

      if (first.pairId === second.pairId) {
        const matchedCards = cards.map((c) =>
          c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
        );
        const matchedPairs = state.matchedPairs + 1;
        const status = matchedPairs === state.totalPairs ? 'won' : 'playing';
        return { ...state, cards: matchedCards, flippedIds: [], matchedPairs, status };
      }

      return { ...state, cards, flippedIds };
    }

    case 'RESOLVE_MISMATCH': {
      const cards = state.cards.map((c) =>
        state.flippedIds.includes(c.id) ? { ...c, isFlipped: false } : c
      );
      return { ...state, cards, flippedIds: [] };
    }

    case 'TICK': {
      if (state.status !== 'playing') return state;
      const timeLeft = Math.max(0, state.timeLeft - 1);
      const status = timeLeft === 0 ? 'lost' : state.status;
      return { ...state, timeLeft, status };
    }

    case 'RESET': {
      return createInitialState(action.cards, action.timeLimit);
    }

    default:
      return state;
  }
}
