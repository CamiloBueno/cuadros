import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer, TIME_LIMIT_SECONDS } from './reducer';
import type { MemoryCardData } from './types';

function makeCards(): MemoryCardData[] {
  return [
    { id: 'p1-image', pairId: 'p1', type: 'image', content: 'img1.png', isFlipped: false, isMatched: false },
    { id: 'p1-text', pairId: 'p1', type: 'text', content: 'Label 1', isFlipped: false, isMatched: false },
    { id: 'p2-image', pairId: 'p2', type: 'image', content: 'img2.png', isFlipped: false, isMatched: false },
    { id: 'p2-text', pairId: 'p2', type: 'text', content: 'Label 2', isFlipped: false, isMatched: false },
  ];
}

describe('createInitialState', () => {
  it('starts with the given cards, zero matches, and the default time limit', () => {
    const state = createInitialState(makeCards());
    expect(state.cards).toHaveLength(4);
    expect(state.matchedPairs).toBe(0);
    expect(state.totalPairs).toBe(2);
    expect(state.timeLeft).toBe(TIME_LIMIT_SECONDS);
    expect(state.status).toBe('playing');
    expect(state.flippedIds).toEqual([]);
  });
});

describe('gameReducer FLIP_CARD', () => {
  it('flips a single card and adds it to flippedIds', () => {
    const state = createInitialState(makeCards());
    const next = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p1-image' });
    expect(next.flippedIds).toEqual(['p1-image']);
    expect(next.cards.find((c) => c.id === 'p1-image')!.isFlipped).toBe(true);
  });

  it('marks both cards matched and increments matchedPairs on a match', () => {
    let state = createInitialState(makeCards());
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p1-image' });
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p1-text' });

    expect(state.matchedPairs).toBe(1);
    expect(state.flippedIds).toEqual([]);
    expect(state.cards.find((c) => c.id === 'p1-image')!.isMatched).toBe(true);
    expect(state.cards.find((c) => c.id === 'p1-text')!.isMatched).toBe(true);
  });

  it('sets status to won when the last pair is matched', () => {
    let state = createInitialState(makeCards());
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p1-image' });
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p1-text' });
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p2-image' });
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p2-text' });

    expect(state.matchedPairs).toBe(2);
    expect(state.status).toBe('won');
  });

  it('keeps both cards flipped (unresolved) on a mismatch', () => {
    let state = createInitialState(makeCards());
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p1-image' });
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p2-text' });

    expect(state.flippedIds).toEqual(['p1-image', 'p2-text']);
    expect(state.cards.find((c) => c.id === 'p1-image')!.isFlipped).toBe(true);
    expect(state.cards.find((c) => c.id === 'p2-text')!.isFlipped).toBe(true);
    expect(state.matchedPairs).toBe(0);
  });

  it('ignores a third flip while two cards are already flipped', () => {
    let state = createInitialState(makeCards());
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p1-image' });
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p2-text' });
    const beforeThirdFlip = state;
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p2-image' });

    expect(state).toEqual(beforeThirdFlip);
  });

  it('ignores flipping an already-matched card', () => {
    let state = createInitialState(makeCards());
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p1-image' });
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p1-text' });
    const afterMatch = state;
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p1-image' });

    expect(state).toEqual(afterMatch);
  });
});

describe('gameReducer RESOLVE_MISMATCH', () => {
  it('flips the two mismatched cards back down and clears flippedIds', () => {
    let state = createInitialState(makeCards());
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p1-image' });
    state = gameReducer(state, { type: 'FLIP_CARD', cardId: 'p2-text' });
    state = gameReducer(state, { type: 'RESOLVE_MISMATCH' });

    expect(state.flippedIds).toEqual([]);
    expect(state.cards.find((c) => c.id === 'p1-image')!.isFlipped).toBe(false);
    expect(state.cards.find((c) => c.id === 'p2-text')!.isFlipped).toBe(false);
  });
});

describe('gameReducer TICK', () => {
  it('decrements timeLeft by 1', () => {
    const state = createInitialState(makeCards());
    const next = gameReducer(state, { type: 'TICK' });
    expect(next.timeLeft).toBe(TIME_LIMIT_SECONDS - 1);
  });

  it('sets status to lost when timeLeft reaches 0', () => {
    let state = createInitialState(makeCards(), 1);
    state = gameReducer(state, { type: 'TICK' });
    expect(state.timeLeft).toBe(0);
    expect(state.status).toBe('lost');
  });

  it('does nothing once the game is no longer playing', () => {
    let state = createInitialState(makeCards(), 1);
    state = gameReducer(state, { type: 'TICK' });
    const afterLoss = state;
    state = gameReducer(state, { type: 'TICK' });
    expect(state).toEqual(afterLoss);
  });
});

describe('gameReducer RESET', () => {
  it('rebuilds a fresh playing state from the given cards', () => {
    let state = createInitialState(makeCards(), 1);
    state = gameReducer(state, { type: 'TICK' });
    expect(state.status).toBe('lost');

    const freshCards = makeCards();
    state = gameReducer(state, { type: 'RESET', cards: freshCards, timeLimit: TIME_LIMIT_SECONDS });

    expect(state.status).toBe('playing');
    expect(state.timeLeft).toBe(TIME_LIMIT_SECONDS);
    expect(state.matchedPairs).toBe(0);
    expect(state.cards).toEqual(freshCards);
  });
});
