import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LetterGrid } from './LetterGrid';

describe('LetterGrid', () => {
  it('renders 26 letter buttons and calls onGuess with the clicked letter', async () => {
    const user = userEvent.setup();
    const onGuess = vi.fn();
    render(<LetterGrid guessedLetters={[]} wrongLetters={[]} disabled={false} onGuess={onGuess} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(26);

    await user.click(screen.getByRole('button', { name: 'S' }));
    expect(onGuess).toHaveBeenCalledWith('S');
  });

  it('disables letters that were already guessed', () => {
    render(<LetterGrid guessedLetters={['S']} wrongLetters={['X']} disabled={false} onGuess={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'S' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'X' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'A' })).toBeEnabled();
  });

  it('disables every letter when disabled is true', () => {
    render(<LetterGrid guessedLetters={[]} wrongLetters={[]} disabled onGuess={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'A' })).toBeDisabled();
  });
});
