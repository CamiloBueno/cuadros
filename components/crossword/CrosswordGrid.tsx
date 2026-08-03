import type { GridCell, GameStatus } from '@/lib/crossword/types';
import { cellKey } from '@/lib/crossword/grid';
import { CrosswordCell } from './CrosswordCell';

interface CrosswordGridProps {
  rows: number;
  cols: number;
  cells: Record<string, GridCell>;
  activeCellKey: string | null;
  status: GameStatus;
  onActivate: (row: number, col: number) => void;
  onChangeLetter: (letter: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  registerCellRef: (key: string, el: HTMLInputElement | null) => void;
}

export function CrosswordGrid({
  rows,
  cols,
  cells,
  activeCellKey,
  status,
  onActivate,
  onChangeLetter,
  onKeyDown,
  registerCellRef,
}: CrosswordGridProps) {
  return (
    <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, 2.5rem)` }}>
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
          const key = cellKey(row, col);
          const cell = cells[key];
          if (!cell) {
            return <div key={key} aria-hidden className="aspect-square" />;
          }
          return (
            <CrosswordCell
              key={key}
              ref={(el) => registerCellRef(key, el)}
              row={row}
              col={col}
              clueNumbers={cell.clueNumbers}
              typedLetter={cell.typedLetter}
              isActive={key === activeCellKey}
              isSolved={status === 'won'}
              onActivate={onActivate}
              onChangeLetter={onChangeLetter}
              onKeyDown={onKeyDown}
            />
          );
        })
      )}
    </div>
  );
}
