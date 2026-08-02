import { forwardRef } from 'react';

interface CrosswordCellProps {
  row: number;
  col: number;
  clueNumbers: number[];
  typedLetter: string;
  isActive: boolean;
  isSolved: boolean;
  onActivate: (row: number, col: number) => void;
  onChangeLetter: (letter: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const CrosswordCell = forwardRef<HTMLInputElement, CrosswordCellProps>(function CrosswordCell(
  { row, col, clueNumbers, typedLetter, isActive, isSolved, onActivate, onChangeLetter, onKeyDown },
  ref
) {
  return (
    <div className="relative aspect-square">
      {clueNumbers.length > 0 && (
        <span className="absolute top-0.5 left-1 text-[10px] leading-none text-gray-500 pointer-events-none">
          {clueNumbers.join(',')}
        </span>
      )}
      <input
        ref={ref}
        type="text"
        inputMode="text"
        maxLength={1}
        value={typedLetter}
        data-cell-row={row}
        data-cell-col={col}
        data-cell-key={`${row}-${col}`}
        data-active={isActive}
        aria-label={`Celda fila ${row}, columna ${col}`}
        onClick={() => onActivate(row, col)}
        onChange={(e) => onChangeLetter(e.target.value)}
        onKeyDown={onKeyDown}
        className={`w-full h-full text-center font-semibold uppercase border rounded-sm outline-none ${
          isActive ? 'bg-yellow-100 border-blue-500' : 'bg-white border-gray-300'
        } ${isSolved ? 'text-green-700' : 'text-gray-900'}`}
      />
    </div>
  );
});
