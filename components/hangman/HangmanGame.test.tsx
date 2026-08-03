import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HangmanGame } from './HangmanGame';

describe('HangmanGame', () => {
  it('renders one word slot per letter of the (deterministic, pre-mount) first word', () => {
    render(<HangmanGame words={['AB']} />);
    expect(screen.getAllByTestId('word-slot')).toHaveLength(2);
  });

  it('reveals a correct letter and shows the win modal when the word is fully guessed', async () => {
    const user = userEvent.setup();
    render(<HangmanGame words={['AB']} />);

    await user.click(screen.getByRole('button', { name: 'A' }));
    await user.click(screen.getByRole('button', { name: 'B' }));

    expect(await screen.findByText('¡Salvaste a Otto!')).toBeInTheDocument();
  });

  it('adds a rabbit part on a wrong letter and shows the lose modal after 7 wrong letters', async () => {
    const user = userEvent.setup();
    render(<HangmanGame words={['A']} />);

    const wrongLetters = ['B', 'C', 'D', 'E', 'F', 'G', 'H'];
    for (const letter of wrongLetters) {
      await user.click(screen.getByRole('button', { name: letter }));
    }

    expect(await screen.findByText('Otto cayó a la horca')).toBeInTheDocument();
    expect(screen.getAllByTestId('rabbit-part')).toHaveLength(7);
  });

  it('restarts with a fresh state when "Reiniciar" is clicked', async () => {
    const user = userEvent.setup();
    render(<HangmanGame words={['A']} />);

    for (const letter of ['B', 'C', 'D', 'E', 'F', 'G', 'H']) {
      await user.click(screen.getByRole('button', { name: letter }));
    }
    await screen.findByText('Otto cayó a la horca');

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(screen.queryAllByTestId('rabbit-part')).toHaveLength(0);
  });
});
