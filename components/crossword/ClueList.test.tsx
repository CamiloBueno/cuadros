import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClueList } from './ClueList';
import type { ClueDefinition } from '@/lib/crossword/types';

function makeClues(): ClueDefinition[] {
  return [
    { id: 'a1', number: 4, direction: 'across', clueText: 'Fiesta de faroles', answer: 'LATERNENFEST', startRow: 3, startCol: 0 },
    { id: 'd1', number: 1, direction: 'down', clueText: 'Personaje de Pascua', answer: 'OSTERHASE', startRow: 0, startCol: 3 },
  ];
}

describe('ClueList', () => {
  it('groups clues under Horizontales and Verticales headings', () => {
    render(<ClueList clues={makeClues()} activeClueId={null} solvedClueIds={new Set()} onSelect={vi.fn()} />);
    expect(screen.getByText('Horizontales')).toBeInTheDocument();
    expect(screen.getByText('Verticales')).toBeInTheDocument();
    expect(screen.getByText(/Fiesta de faroles/)).toBeInTheDocument();
    expect(screen.getByText(/Personaje de Pascua/)).toBeInTheDocument();
  });

  it('calls onSelect with the clue id when clicked', () => {
    const onSelect = vi.fn();
    render(<ClueList clues={makeClues()} activeClueId={null} solvedClueIds={new Set()} onSelect={onSelect} />);
    fireEvent.click(screen.getByText(/Fiesta de faroles/));
    expect(onSelect).toHaveBeenCalledWith('a1');
  });

  it('marks the active clue with a data attribute', () => {
    render(<ClueList clues={makeClues()} activeClueId="d1" solvedClueIds={new Set()} onSelect={vi.fn()} />);
    expect(screen.getByTestId('clue-d1')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('clue-a1')).toHaveAttribute('data-active', 'false');
  });

  it('marks solved clues with a data attribute', () => {
    render(<ClueList clues={makeClues()} activeClueId={null} solvedClueIds={new Set(['a1'])} onSelect={vi.fn()} />);
    expect(screen.getByTestId('clue-a1')).toHaveAttribute('data-solved', 'true');
    expect(screen.getByTestId('clue-d1')).toHaveAttribute('data-solved', 'false');
  });
});
