import { describe, expect, it } from 'vitest';
import { createInitialState, gameReducer } from './reducer';
import { MAX_WRONG_GUESSES } from './types';

describe('createInitialState', () => {
  it('starts in playing status with no guesses', () => {
    const state = createInitialState('SCHULE');
    expect(state).toEqual({
      word: 'SCHULE',
      guessedLetters: [],
      wrongLetters: [],
      status: 'playing',
    });
  });
});

describe('gameReducer', () => {
  it('adds a correct letter to guessedLetters', () => {
    const state = createInitialState('SCHULE');
    const next = gameReducer(state, { type: 'GUESS_LETTER', letter: 'S' });
    expect(next.guessedLetters).toEqual(['S']);
    expect(next.wrongLetters).toEqual([]);
    expect(next.status).toBe('playing');
  });

  it('adds an incorrect letter to wrongLetters', () => {
    const state = createInitialState('SCHULE');
    const next = gameReducer(state, { type: 'GUESS_LETTER', letter: 'X' });
    expect(next.wrongLetters).toEqual(['X']);
    expect(next.guessedLetters).toEqual([]);
    expect(next.status).toBe('playing');
  });

  it('normalizes lowercase letters to uppercase', () => {
    const state = createInitialState('SCHULE');
    const next = gameReducer(state, { type: 'GUESS_LETTER', letter: 's' });
    expect(next.guessedLetters).toEqual(['S']);
  });

  it('ignores a letter that was already guessed correctly', () => {
    const state = { ...createInitialState('SCHULE'), guessedLetters: ['S'] };
    const next = gameReducer(state, { type: 'GUESS_LETTER', letter: 'S' });
    expect(next).toBe(state);
  });

  it('ignores a letter that was already guessed incorrectly', () => {
    const state = { ...createInitialState('SCHULE'), wrongLetters: ['X'] };
    const next = gameReducer(state, { type: 'GUESS_LETTER', letter: 'X' });
    expect(next).toBe(state);
  });

  it('ignores guesses once the game is won or lost', () => {
    const wonState: ReturnType<typeof createInitialState> = { ...createInitialState('AB'), status: 'won' };
    expect(gameReducer(wonState, { type: 'GUESS_LETTER', letter: 'Z' })).toBe(wonState);
  });

  it('wins when every unique letter of the word has been guessed', () => {
    let state = createInitialState('AB');
    state = gameReducer(state, { type: 'GUESS_LETTER', letter: 'A' });
    expect(state.status).toBe('playing');
    state = gameReducer(state, { type: 'GUESS_LETTER', letter: 'B' });
    expect(state.status).toBe('won');
  });

  it('wins with a word that repeats letters once all unique letters are covered', () => {
    let state = createInitialState('MAUER');
    for (const letter of ['M', 'A', 'U', 'E', 'R']) {
      state = gameReducer(state, { type: 'GUESS_LETTER', letter });
    }
    expect(state.status).toBe('won');
  });

  it('loses after MAX_WRONG_GUESSES incorrect letters', () => {
    let state = createInitialState('SCHULE');
    const wrongLetters = ['A', 'B', 'D', 'F', 'G', 'I', 'J'];
    expect(wrongLetters).toHaveLength(MAX_WRONG_GUESSES);
    wrongLetters.forEach((letter, index) => {
      state = gameReducer(state, { type: 'GUESS_LETTER', letter });
      const expectedStatus = index === MAX_WRONG_GUESSES - 1 ? 'lost' : 'playing';
      expect(state.status).toBe(expectedStatus);
    });
  });

  it('resets to a new word and clears progress', () => {
    let state = createInitialState('SCHULE');
    state = gameReducer(state, { type: 'GUESS_LETTER', letter: 'S' });
    state = gameReducer(state, { type: 'RESET', word: 'HEIMAT' });
    expect(state).toEqual(createInitialState('HEIMAT'));
  });
});
