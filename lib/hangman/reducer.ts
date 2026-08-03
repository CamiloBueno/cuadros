import type { GameState } from './types';
import { MAX_WRONG_GUESSES } from './types';

export type GameAction =
  | { type: 'GUESS_LETTER'; letter: string }
  | { type: 'RESET'; word: string };

export function createInitialState(word: string): GameState {
  return {
    word: word.toUpperCase(),
    guessedLetters: [],
    wrongLetters: [],
    status: 'playing',
  };
}

function uniqueLetters(word: string): string[] {
  return Array.from(new Set(word.split('')));
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'GUESS_LETTER': {
      if (state.status !== 'playing') return state;

      const letter = action.letter.toUpperCase();
      if (state.guessedLetters.includes(letter) || state.wrongLetters.includes(letter)) {
        return state;
      }

      if (state.word.includes(letter)) {
        const guessedLetters = [...state.guessedLetters, letter];
        const won = uniqueLetters(state.word).every((l) => guessedLetters.includes(l));
        return { ...state, guessedLetters, status: won ? 'won' : 'playing' };
      }

      const wrongLetters = [...state.wrongLetters, letter];
      const lost = wrongLetters.length === MAX_WRONG_GUESSES;
      return { ...state, wrongLetters, status: lost ? 'lost' : 'playing' };
    }

    case 'RESET':
      return createInitialState(action.word);

    default:
      return state;
  }
}
