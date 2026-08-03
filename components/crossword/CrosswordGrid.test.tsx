import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CrosswordGrid } from './CrosswordGrid';
import { buildGrid, cellKey } from '@/lib/crossword/grid';
import type { ClueDefinition } from '@/lib/crossword/types';

// across "CAT" at (0,0), down "ACT" at (0,1) -> 2x3 bounding box, 5 of 6 cells filled
const ACROSS: ClueDefinition = { id: 'a1', number: 1, direction: 'across', clueText: '', answer: 'CAT', startRow: 0, startCol: 0 };
const DOWN: ClueDefinition = { id: 'd1', number: 2, direction: 'down', clueText: '', answer: 'ACT', startRow: 0, startCol: 1 };

function setup(activeCellKey: string | null = null) {
  const { cells, rows, cols } = buildGrid([ACROSS, DOWN]);
  render(
    <CrosswordGrid
      rows={rows}
      cols={cols}
      cells={cells}
      activeCellKey={activeCellKey}
      status="playing"
      onActivate={vi.fn()}
      onChangeLetter={vi.fn()}
      onKeyDown={vi.fn()}
      registerCellRef={vi.fn()}
    />
  );
}

describe('CrosswordGrid', () => {
  it('renders one input per real cell and no inputs for blocked positions', () => {
    setup();
    // real cells: (0,0) (0,1) (0,2) (1,1) (2,1) = 5; bounding box is 3x3 = 9 positions
    expect(screen.getAllByRole('textbox')).toHaveLength(5);
  });

  it('marks only the active cell as active', () => {
    setup(cellKey(0, 1));
    expect(document.querySelector('[data-cell-key="0-1"]')).toHaveAttribute('data-active', 'true');
    expect(document.querySelector('[data-cell-key="0-0"]')).toHaveAttribute('data-active', 'false');
  });
});
