import { describe, it, expect, vi, afterEach } from 'vitest';
import { shuffleArray, buildDeck } from './shuffle';
import type { MemoryPair } from './types';

describe('shuffleArray', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns an array with the same elements (order may differ)', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual(input.sort());
  });

  it('does not mutate the original array', () => {
    const input = [1, 2, 3];
    shuffleArray(input);
    expect(input).toEqual([1, 2, 3]);
  });

  it('produces the expected permutation when Math.random always returns 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = shuffleArray([1, 2, 3, 4]);
    expect(result).toEqual([2, 3, 4, 1]);
  });
});

describe('buildDeck', () => {
  const pairs: MemoryPair[] = [
    { id: 'p1', imageUrl: 'img1.png', labelText: 'Label 1' },
    { id: 'p2', imageUrl: 'img2.png', labelText: 'Label 2' },
  ];

  it('creates 2 cards per pair', () => {
    const deck = buildDeck(pairs);
    expect(deck).toHaveLength(pairs.length * 2);
  });

  it('creates exactly one image card and one text card per pair', () => {
    const deck = buildDeck(pairs);
    for (const pair of pairs) {
      const cardsForPair = deck.filter((c) => c.pairId === pair.id);
      expect(cardsForPair).toHaveLength(2);
      expect(cardsForPair.map((c) => c.type).sort()).toEqual(['image', 'text']);
      const imageCard = cardsForPair.find((c) => c.type === 'image')!;
      const textCard = cardsForPair.find((c) => c.type === 'text')!;
      expect(imageCard.content).toBe(pair.imageUrl);
      expect(textCard.content).toBe(pair.labelText);
    }
  });

  it('starts every card unflipped and unmatched', () => {
    const deck = buildDeck(pairs);
    expect(deck.every((c) => !c.isFlipped && !c.isMatched)).toBe(true);
  });
});
