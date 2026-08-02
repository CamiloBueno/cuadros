import type { MemoryCardData, MemoryPair } from './types';

export function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildOrderedDeck(pairs: MemoryPair[]): MemoryCardData[] {
  return pairs.flatMap((pair) => [
    {
      id: `${pair.id}-image`,
      pairId: pair.id,
      type: 'image' as const,
      content: pair.imageUrl,
      isFlipped: false,
      isMatched: false,
    },
    {
      id: `${pair.id}-text`,
      pairId: pair.id,
      type: 'text' as const,
      content: pair.labelText,
      isFlipped: false,
      isMatched: false,
    },
  ]);
}

export function buildDeck(pairs: MemoryPair[]): MemoryCardData[] {
  return shuffleArray(buildOrderedDeck(pairs));
}
