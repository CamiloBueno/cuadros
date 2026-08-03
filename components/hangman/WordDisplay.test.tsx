import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WordDisplay } from './WordDisplay';

describe('WordDisplay', () => {
  it('reveals only guessed letters and hides the rest', () => {
    render(<WordDisplay word="SCHULE" guessedLetters={['S', 'E']} />);

    const slots = screen.getAllByTestId('word-slot');
    expect(slots).toHaveLength(6);
    expect(slots[0]).toHaveTextContent('S');
    expect(slots[1]).toHaveTextContent('');
    expect(slots[5]).toHaveTextContent('E');
  });
});
