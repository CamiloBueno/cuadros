import { describe, it, expect } from 'vitest';
import { createInitialState, crosswordReducer } from './reducer';
import { cellKey } from './grid';
import type { ClueDefinition } from './types';

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

// A small crossing puzzle used across most tests:
//   across "CAT" at (0,0)  ->  C(0,0) A(0,1) T(0,2)
//   down   "ACT" at (0,1)  ->  A(0,1) C(1,1) T(2,1)   (shares 'A' with the across word)
const ACROSS = clue({ id: 'a1', number: 1, direction: 'across', answer: 'CAT', startRow: 0, startCol: 0 });
const DOWN = clue({ id: 'd1', number: 2, direction: 'down', answer: 'ACT', startRow: 0, startCol: 1 });

describe('createInitialState', () => {
  it('activates the first clue\'s start cell and direction, status playing', () => {
    const state = createInitialState([ACROSS, DOWN]);
    expect(state.activeCellKey).toBe(cellKey(0, 0));
    expect(state.activeDirection).toBe('across');
    expect(state.status).toBe('playing');
  });
});

describe('crosswordReducer — TYPE_LETTER', () => {
  it('writes the normalized letter into the active cell', () => {
    const state = createInitialState([ACROSS, DOWN]);
    const next = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'c' });
    expect(next.cells[cellKey(0, 0)].typedLetter).toBe('C');
  });

  it('advances the active cell to the next cell in the active word', () => {
    const state = createInitialState([ACROSS, DOWN]);
    const next = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'C' });
    expect(next.activeCellKey).toBe(cellKey(0, 1));
  });

  it('stays on the last cell of the word once typed', () => {
    let state = createInitialState([ACROSS, DOWN]);
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'C' });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'A' });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'T' });
    expect(state.activeCellKey).toBe(cellKey(0, 2));
  });

  it('is a no-op for non-letter input', () => {
    const state = createInitialState([ACROSS, DOWN]);
    const next = crosswordReducer(state, { type: 'TYPE_LETTER', letter: '5' });
    expect(next.cells[cellKey(0, 0)].typedLetter).toBe('');
  });

  it('sets status to won once every word is correctly filled', () => {
    let state = createInitialState([ACROSS, DOWN]);
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'C' });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'A' });
    state = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 1, col: 1 });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'C' });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'T' });
    // finish the across word's last cell too
    state = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 0, col: 2 });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'T' });
    expect(state.status).toBe('won');
  });

  it('is a no-op once the puzzle is already won', () => {
    let state = createInitialState([ACROSS, DOWN]);
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'C' });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'A' });
    state = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 1, col: 1 });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'C' });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'T' });
    state = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 0, col: 2 });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'T' });
    expect(state.status).toBe('won');

    const next = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'X' });
    expect(next.cells[cellKey(0, 2)].typedLetter).toBe('T');
  });
});

describe('crosswordReducer — BACKSPACE', () => {
  it('clears a filled active cell without moving', () => {
    let state = createInitialState([ACROSS, DOWN]);
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'C' });
    state = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 0, col: 0 });
    const next = crosswordReducer(state, { type: 'BACKSPACE' });
    expect(next.cells[cellKey(0, 0)].typedLetter).toBe('');
    expect(next.activeCellKey).toBe(cellKey(0, 0));
  });

  it('moves back and clears the previous cell when the active cell is empty', () => {
    let state = createInitialState([ACROSS, DOWN]);
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'C' }); // now active = (0,1)
    const next = crosswordReducer(state, { type: 'BACKSPACE' });
    expect(next.activeCellKey).toBe(cellKey(0, 0));
    expect(next.cells[cellKey(0, 0)].typedLetter).toBe('');
  });

  it('is a no-op at the first cell of a word with nothing typed', () => {
    const state = createInitialState([ACROSS, DOWN]);
    const next = crosswordReducer(state, { type: 'BACKSPACE' });
    expect(next).toEqual(state);
  });
});

describe('crosswordReducer — ACTIVATE_CELL', () => {
  it('activates a different cell, keeping direction when supported', () => {
    const state = createInitialState([ACROSS, DOWN]);
    const next = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 0, col: 2 });
    expect(next.activeCellKey).toBe(cellKey(0, 2));
    expect(next.activeDirection).toBe('across');
  });

  it('falls back to a supported direction when the previous one does not apply', () => {
    const state = createInitialState([ACROSS, DOWN]);
    const next = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 1, col: 1 });
    expect(next.activeCellKey).toBe(cellKey(1, 1));
    expect(next.activeDirection).toBe('down');
  });

  it('toggles direction when clicking the same shared cell again', () => {
    let state = createInitialState([ACROSS, DOWN]);
    state = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 0, col: 1 });
    expect(state.activeDirection).toBe('across');
    const next = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 0, col: 1 });
    expect(next.activeDirection).toBe('down');
  });

  it('is a no-op for a cell outside the grid', () => {
    const state = createInitialState([ACROSS, DOWN]);
    const next = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 9, col: 9 });
    expect(next).toEqual(state);
  });
});

describe('crosswordReducer — ACTIVATE_CLUE', () => {
  it('sets active cell and direction to the clue\'s start', () => {
    const state = createInitialState([ACROSS, DOWN]);
    const next = crosswordReducer(state, { type: 'ACTIVATE_CLUE', clueId: 'd1' });
    expect(next.activeCellKey).toBe(cellKey(0, 1));
    expect(next.activeDirection).toBe('down');
  });
});

describe('crosswordReducer — MOVE', () => {
  it('is a no-op when the destination cell does not exist', () => {
    let state = createInitialState([ACROSS, DOWN]);
    state = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 1, col: 1 }); // down direction, no cell at (1,0)
    const next = crosswordReducer(state, { type: 'MOVE', deltaRow: 0, deltaCol: -1 });
    expect(next).toBe(state);
  });

  it('is a no-op when moving off the edge of the grid', () => {
    const state = createInitialState([ACROSS, DOWN]);
    const next = crosswordReducer(state, { type: 'MOVE', deltaRow: 5, deltaCol: 5 });
    expect(next).toEqual(state);
  });

  it('moves down and switches to down direction when possible', () => {
    const state = createInitialState([ACROSS, DOWN]); // active (0,0), across
    const next = crosswordReducer(state, { type: 'MOVE', deltaRow: 0, deltaCol: 1 });
    expect(next.activeCellKey).toBe(cellKey(0, 1));
    expect(next.activeDirection).toBe('across');
  });

  it('remains allowed once the puzzle is won', () => {
    let state = createInitialState([ACROSS, DOWN]);
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'C' });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'A' });
    state = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 1, col: 1 });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'C' });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'T' });
    state = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 0, col: 2 });
    state = crosswordReducer(state, { type: 'TYPE_LETTER', letter: 'T' });
    expect(state.status).toBe('won');

    const next = crosswordReducer(state, { type: 'ACTIVATE_CELL', row: 0, col: 0 });
    expect(next.activeCellKey).toBe(cellKey(0, 0));
  });
});

describe('crosswordReducer — RESET', () => {
  it('restores the initial state', () => {
    const initial = createInitialState([ACROSS, DOWN]);
    let state = crosswordReducer(initial, { type: 'TYPE_LETTER', letter: 'C' });
    state = crosswordReducer(state, { type: 'RESET' });
    expect(state).toEqual(initial);
  });
});
