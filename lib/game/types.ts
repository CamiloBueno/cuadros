export type CardType = 'image' | 'text';

export interface MemoryPair {
  id: string;
  imageUrl: string;
  labelText: string;
}

export interface MemoryCardData {
  id: string;
  pairId: string;
  type: CardType;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  cards: MemoryCardData[];
  flippedIds: string[];
  matchedPairs: number;
  totalPairs: number;
  timeLeft: number;
  status: GameStatus;
}
