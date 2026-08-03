import type { ClueDefinition, GridCell } from './types';

export function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

export function clueCellKeys(clue: ClueDefinition): string[] {
  return Array.from({ length: clue.answer.length }, (_, i) => {
    const row = clue.direction === 'down' ? clue.startRow + i : clue.startRow;
    const col = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
    return cellKey(row, col);
  });
}

export function buildGrid(clues: ClueDefinition[]): {
  cells: Record<string, GridCell>;
  rows: number;
  cols: number;
} {
  const cells: Record<string, GridCell> = {};
  let maxRow = 0;
  let maxCol = 0;

  for (const clue of clues) {
    const keys = clueCellKeys(clue);
    for (let i = 0; i < clue.answer.length; i++) {
      const [row, col] = keys[i].split('-').map(Number);
      const letter = clue.answer[i];
      const key = keys[i];
      const isStart = i === 0;

      const existing = cells[key];
      if (existing) {
        if (existing.solutionLetter !== letter) {
          throw new Error(
            `Intersecting clues disagree at (${row},${col}): '${existing.solutionLetter}' vs '${letter}'`
          );
        }
        existing.memberOf[clue.direction] = clue.id;
        if (isStart) existing.clueNumbers = [...existing.clueNumbers, clue.number];
      } else {
        cells[key] = {
          row,
          col,
          solutionLetter: letter,
          typedLetter: '',
          clueNumbers: isStart ? [clue.number] : [],
          memberOf: { [clue.direction]: clue.id },
        };
      }

      maxRow = Math.max(maxRow, row);
      maxCol = Math.max(maxCol, col);
    }
  }

  return { cells, rows: maxRow + 1, cols: maxCol + 1 };
}
