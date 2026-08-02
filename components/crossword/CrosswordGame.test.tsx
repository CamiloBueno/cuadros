import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CrosswordGame } from './CrosswordGame';
import type { ClueDefinition } from '@/lib/crossword/types';

// across "CAT" at (0,0) -> C(0,0) A(0,1) T(0,2)
// down   "ACT" at (0,1) -> A(0,1) C(1,1) T(2,1)   (shares 'A' at (0,1))
const ACROSS: ClueDefinition = { id: 'a1', number: 1, direction: 'across', clueText: 'Felino', answer: 'CAT', startRow: 0, startCol: 0 };
const DOWN: ClueDefinition = { id: 'd1', number: 2, direction: 'down', clueText: 'Verbo actuar', answer: 'ACT', startRow: 0, startCol: 1 };

function cellInput(row: number, col: number) {
  return document.querySelector(`[data-cell-key="${row}-${col}"]`) as HTMLInputElement;
}

describe('CrosswordGame', () => {
  it('starts with the first clue active and progress at 0 of total', () => {
    render(<CrosswordGame clues={[ACROSS, DOWN]} />);
    expect(screen.getByText('Has encontrado 0 de 2 palabras')).toBeInTheDocument();
    expect(cellInput(0, 0)).toHaveAttribute('data-active', 'true');
  });

  it('typing a letter fills the cell and advances focus to the next cell in the word', () => {
    render(<CrosswordGame clues={[ACROSS, DOWN]} />);
    fireEvent.change(cellInput(0, 0), { target: { value: 'c' } });
    expect(cellInput(0, 0)).toHaveValue('C');
    expect(document.activeElement).toBe(cellInput(0, 1));
  });

  it('clicking a different cell activates it', () => {
    render(<CrosswordGame clues={[ACROSS, DOWN]} />);
    fireEvent.click(cellInput(0, 2));
    expect(cellInput(0, 2)).toHaveAttribute('data-active', 'true');
    expect(cellInput(0, 0)).toHaveAttribute('data-active', 'false');
  });

  it('clicking the shared cell twice toggles direction, changing the active clue', () => {
    render(<CrosswordGame clues={[ACROSS, DOWN]} />);
    fireEvent.click(cellInput(0, 1));
    expect(screen.getByTestId('clue-a1')).toHaveAttribute('data-active', 'true');

    fireEvent.click(cellInput(0, 1));
    expect(screen.getByTestId('clue-d1')).toHaveAttribute('data-active', 'true');
  });

  it('clicking a clue in the list activates its start cell', () => {
    render(<CrosswordGame clues={[ACROSS, DOWN]} />);
    fireEvent.click(screen.getByTestId('clue-d1'));
    expect(cellInput(0, 1)).toHaveAttribute('data-active', 'true');
  });

  it('arrow-key navigation moves the active cell', () => {
    render(<CrosswordGame clues={[ACROSS, DOWN]} />);
    fireEvent.keyDown(cellInput(0, 0), { key: 'ArrowRight' });
    expect(cellInput(0, 1)).toHaveAttribute('data-active', 'true');
  });

  it('backspace on an empty cell moves back and clears the previous cell', () => {
    render(<CrosswordGame clues={[ACROSS, DOWN]} />);
    fireEvent.change(cellInput(0, 0), { target: { value: 'c' } }); // active moves to (0,1)
    fireEvent.keyDown(cellInput(0, 1), { key: 'Backspace' });
    expect(cellInput(0, 0)).toHaveValue('');
    expect(cellInput(0, 0)).toHaveAttribute('data-active', 'true');
  });

  it('shows the win state once every word is filled correctly', () => {
    render(<CrosswordGame clues={[ACROSS, DOWN]} />);
    // active cell starts at (0,0); typing auto-advances within the across word
    fireEvent.change(cellInput(0, 0), { target: { value: 'c' } });
    fireEvent.change(cellInput(0, 1), { target: { value: 'a' } });
    fireEvent.change(cellInput(0, 2), { target: { value: 't' } });
    // switch to the down word explicitly, as a real user clicking a new cell would
    fireEvent.click(cellInput(1, 1));
    fireEvent.change(cellInput(1, 1), { target: { value: 'c' } });
    fireEvent.change(cellInput(2, 1), { target: { value: 't' } });

    expect(screen.getByText('Has encontrado 2 de 2 palabras')).toBeInTheDocument();
    expect(screen.getByText(/completaste el crucigrama/i)).toBeInTheDocument();
  });
});
