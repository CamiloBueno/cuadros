import { describe, it, expect } from 'vitest';
import { buildGrid, cellKey, clueCellKeys } from './grid';
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

describe('buildGrid', () => {
  it('marks a cell shared by an across and a down word with both memberships', () => {
    const across = clue({ id: 'a1', number: 1, direction: 'across', answer: 'CAT', startRow: 0, startCol: 0 });
    const down = clue({ id: 'd1', number: 2, direction: 'down', answer: 'ACT', startRow: 0, startCol: 1 });
    // across: C(0,0) A(0,1) T(0,2) — down: A(0,1) C(1,1) T(2,1) — shared cell (0,1) = 'A'
    const { cells } = buildGrid([across, down]);

    const shared = cells[cellKey(0, 1)];
    expect(shared.solutionLetter).toBe('A');
    expect(shared.memberOf.across).toBe('a1');
    expect(shared.memberOf.down).toBe('d1');
  });

  it('sets clueNumbers only on a word\'s starting cell, not on every cell', () => {
    const across = clue({ id: 'a1', number: 1, direction: 'across', answer: 'CAT', startRow: 0, startCol: 0 });
    const { cells } = buildGrid([across]);

    expect(cells[cellKey(0, 0)].clueNumbers).toEqual([1]);
    expect(cells[cellKey(0, 1)].clueNumbers).toEqual([]);
    expect(cells[cellKey(0, 2)].clueNumbers).toEqual([]);
  });

  it('lists both numbers on a cell where two words start at the same position', () => {
    const down = clue({ id: 'd1', number: 1, direction: 'down', answer: 'OSTERHASE', startRow: 0, startCol: 3 });
    const across = clue({ id: 'a6', number: 6, direction: 'across', answer: 'OKTOBERFEST', startRow: 0, startCol: 3 });
    const { cells } = buildGrid([down, across]);

    expect(cells[cellKey(0, 3)].clueNumbers).toEqual([1, 6]);
  });

  it('keeps non-intersecting words on separate cells', () => {
    const a = clue({ id: 'a1', number: 1, direction: 'across', answer: 'CAT', startRow: 0, startCol: 0 });
    const b = clue({ id: 'a2', number: 2, direction: 'across', answer: 'DOG', startRow: 5, startCol: 0 });
    const { cells } = buildGrid([a, b]);

    expect(Object.keys(cells)).toHaveLength(6);
    expect(cells[cellKey(0, 0)].solutionLetter).toBe('C');
    expect(cells[cellKey(5, 0)].solutionLetter).toBe('D');
  });

  it('derives rows/cols from the bounding box of all cells', () => {
    const across = clue({ id: 'a1', number: 1, direction: 'across', answer: 'CAT', startRow: 0, startCol: 0 });
    const down = clue({ id: 'd1', number: 2, direction: 'down', answer: 'ACT', startRow: 0, startCol: 1 });
    const { rows, cols } = buildGrid([across, down]);

    expect(rows).toBe(3);
    expect(cols).toBe(3);
  });

  it('lists the ordered cell keys covered by an across clue', () => {
    const across = clue({ id: 'a1', direction: 'across', answer: 'CAT', startRow: 0, startCol: 0 });
    expect(clueCellKeys(across)).toEqual([cellKey(0, 0), cellKey(0, 1), cellKey(0, 2)]);
  });

  it('lists the ordered cell keys covered by a down clue', () => {
    const down = clue({ id: 'd1', direction: 'down', answer: 'CAT', startRow: 0, startCol: 0 });
    expect(clueCellKeys(down)).toEqual([cellKey(0, 0), cellKey(1, 0), cellKey(2, 0)]);
  });

  it('throws when two words disagree on the letter at a shared cell', () => {
    const across = clue({ id: 'a1', number: 1, direction: 'across', answer: 'CAT', startRow: 0, startCol: 0 });
    const down = clue({ id: 'd1', number: 2, direction: 'down', answer: 'ZZZ', startRow: 0, startCol: 1 });

    expect(() => buildGrid([across, down])).toThrow();
  });
});
