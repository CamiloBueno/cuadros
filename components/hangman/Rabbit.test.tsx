import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Rabbit } from './Rabbit';

describe('Rabbit', () => {
  it('shows no rabbit parts when there are no wrong letters', () => {
    render(<Rabbit wrongLetters={[]} />);
    expect(screen.queryAllByTestId('rabbit-part')).toHaveLength(0);
  });

  it('shows one part per wrong letter, in RABBIT_PARTS order', () => {
    render(<Rabbit wrongLetters={['X', 'Y', 'Z']} />);
    const parts = screen.getAllByTestId('rabbit-part');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toHaveAttribute('data-part', 'head');
    expect(parts[1]).toHaveAttribute('data-part', 'torso');
    expect(parts[2]).toHaveAttribute('data-part', 'leftArm');
  });

  it('shows at most the 7 defined parts even with more wrong letters', () => {
    render(<Rabbit wrongLetters={['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']} />);
    expect(screen.getAllByTestId('rabbit-part')).toHaveLength(7);
  });

  it('always renders the gallows, regardless of wrong letters', () => {
    render(<Rabbit wrongLetters={[]} />);
    expect(screen.getByTestId('gallows')).toBeInTheDocument();
  });
});
