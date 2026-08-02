import { describe, it, expect } from 'vitest';
import { normalizeAnswer, isWordComplete, isPuzzleSolved } from './validation';
import { buildGrid, cellKey } from './grid';
import type { ClueDefinition, CrosswordState } from './types';

function clue(overrides: Partial<ClueDefinition>): ClueDefinition {
  return {
    id: 'c1',
    number: 1,
    direction: 'across',
    clueText: 'clue',
    answer: 'CAT',
    startRow: 0,
    startCol: 0,
    ...overrides,
  };
}

function makeState(clues: ClueDefinition[]): CrosswordState {
  const { cells, rows, cols } = buildGrid(clues);
  return { clues, cells, rows, cols, activeCellKey: null, activeDirection: 'across', status: 'playing' };
}

describe('normalizeAnswer', () => {
  it('uppercases and strips accents', () => {
    expect(normalizeAnswer('café')).toBe('CAFE');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeAnswer('  piano ')).toBe('PIANO');
  });
});

describe('isWordComplete', () => {
  it('is false while any cell of the word is empty', () => {
    const definition = clue({ id: 'a1', answer: 'CAT' });
    const state = makeState([definition]);

    expect(isWordComplete(state, definition)).toBe(false);
  });

  it('is true once every cell matches the solution, case/accent-insensitively', () => {
    const definition = clue({ id: 'a1', answer: 'CAT' });
    const state = makeState([definition]);
    state.cells[cellKey(0, 0)].typedLetter = normalizeAnswer('c');
    state.cells[cellKey(0, 1)].typedLetter = normalizeAnswer('a');
    state.cells[cellKey(0, 2)].typedLetter = normalizeAnswer('t');

    expect(isWordComplete(state, definition)).toBe(true);
  });

  it('is false when a typed letter is wrong', () => {
    const definition = clue({ id: 'a1', answer: 'CAT' });
    const state = makeState([definition]);
    state.cells[cellKey(0, 0)].typedLetter = 'C';
    state.cells[cellKey(0, 1)].typedLetter = 'A';
    state.cells[cellKey(0, 2)].typedLetter = 'X';

    expect(isWordComplete(state, definition)).toBe(false);
  });
});

describe('isPuzzleSolved', () => {
  it('requires every clue to be complete, not just filled', () => {
    const a = clue({ id: 'a1', number: 1, direction: 'across', answer: 'CAT', startRow: 0, startCol: 0 });
    const b = clue({ id: 'a2', number: 2, direction: 'across', answer: 'DOG', startRow: 5, startCol: 0 });
    const state = makeState([a, b]);
    state.cells[cellKey(0, 0)].typedLetter = 'C';
    state.cells[cellKey(0, 1)].typedLetter = 'A';
    state.cells[cellKey(0, 2)].typedLetter = 'T';
    // second word left empty

    expect(isPuzzleSolved(state)).toBe(false);
  });

  it('is true once all clues are complete, including a reversed-word answer like ACEDOSA', () => {
    const a = clue({ id: 'a1', number: 1, direction: 'across', answer: 'CAT', startRow: 0, startCol: 0 });
    const b = clue({ id: 'a2', number: 2, direction: 'across', answer: 'ACEDOSA', startRow: 5, startCol: 0 });
    const state = makeState([a, b]);
    'CAT'.split('').forEach((ch, i) => (state.cells[cellKey(0, i)].typedLetter = ch));
    'ACEDOSA'.split('').forEach((ch, i) => (state.cells[cellKey(5, i)].typedLetter = ch));

    expect(isPuzzleSolved(state)).toBe(true);
  });
});
