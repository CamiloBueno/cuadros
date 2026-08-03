import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CrosswordCell } from './CrosswordCell';

describe('CrosswordCell', () => {
  it('renders the typed letter', () => {
    render(
      <CrosswordCell
        row={0}
        col={3}
        clueNumbers={[]}
        typedLetter="O"
        isActive={false}
        isSolved={false}
        onActivate={vi.fn()}
        onChangeLetter={vi.fn()}
        onKeyDown={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('O')).toBeInTheDocument();
  });

  it('shows a clue number badge only when clueNumbers is non-empty', () => {
    const { rerender } = render(
      <CrosswordCell
        row={0}
        col={3}
        clueNumbers={[1, 6]}
        typedLetter=""
        isActive={false}
        isSolved={false}
        onActivate={vi.fn()}
        onChangeLetter={vi.fn()}
        onKeyDown={vi.fn()}
      />
    );
    expect(screen.getByText('1,6')).toBeInTheDocument();

    rerender(
      <CrosswordCell
        row={1}
        col={1}
        clueNumbers={[]}
        typedLetter=""
        isActive={false}
        isSolved={false}
        onActivate={vi.fn()}
        onChangeLetter={vi.fn()}
        onKeyDown={vi.fn()}
      />
    );
    expect(screen.queryByText('1,6')).not.toBeInTheDocument();
  });

  it('has a data-cell-key test hook derived from row/col', () => {
    render(
      <CrosswordCell
        row={2}
        col={5}
        clueNumbers={[]}
        typedLetter=""
        isActive={false}
        isSolved={false}
        onActivate={vi.fn()}
        onChangeLetter={vi.fn()}
        onKeyDown={vi.fn()}
      />
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('data-cell-key', '2-5');
  });

  it('calls onActivate with row/col when clicked', () => {
    const onActivate = vi.fn();
    render(
      <CrosswordCell
        row={2}
        col={5}
        clueNumbers={[]}
        typedLetter=""
        isActive={false}
        isSolved={false}
        onActivate={onActivate}
        onChangeLetter={vi.fn()}
        onKeyDown={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('textbox'));
    expect(onActivate).toHaveBeenCalledWith(2, 5);
  });

  it('calls onChangeLetter with the typed character', () => {
    const onChangeLetter = vi.fn();
    render(
      <CrosswordCell
        row={0}
        col={0}
        clueNumbers={[]}
        typedLetter=""
        isActive
        isSolved={false}
        onActivate={vi.fn()}
        onChangeLetter={onChangeLetter}
        onKeyDown={vi.fn()}
      />
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
    expect(onChangeLetter).toHaveBeenCalledWith('a');
  });

  it('calls onKeyDown on key events', () => {
    const onKeyDown = vi.fn();
    render(
      <CrosswordCell
        row={0}
        col={0}
        clueNumbers={[]}
        typedLetter=""
        isActive
        isSolved={false}
        onActivate={vi.fn()}
        onChangeLetter={vi.fn()}
        onKeyDown={onKeyDown}
      />
    );
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Backspace' });
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('applies an active visual state distinct from inactive', () => {
    const { rerender, container } = render(
      <CrosswordCell
        row={0}
        col={0}
        clueNumbers={[]}
        typedLetter=""
        isActive={false}
        isSolved={false}
        onActivate={vi.fn()}
        onChangeLetter={vi.fn()}
        onKeyDown={vi.fn()}
      />
    );
    const inactiveClass = container.querySelector('input')?.className;

    rerender(
      <CrosswordCell
        row={0}
        col={0}
        clueNumbers={[]}
        typedLetter=""
        isActive
        isSolved={false}
        onActivate={vi.fn()}
        onChangeLetter={vi.fn()}
        onKeyDown={vi.fn()}
      />
    );
    const activeClass = container.querySelector('input')?.className;

    expect(activeClass).not.toBe(inactiveClass);
  });

  it('exposes isActive via a data-active attribute', () => {
    render(
      <CrosswordCell
        row={0}
        col={0}
        clueNumbers={[]}
        typedLetter=""
        isActive
        isSolved={false}
        onActivate={vi.fn()}
        onChangeLetter={vi.fn()}
        onKeyDown={vi.fn()}
      />
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('data-active', 'true');
  });
});
