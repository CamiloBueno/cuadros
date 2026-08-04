import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PuzzleGame } from './PuzzleGame';
import { EXPECTED_PIECE_COUNT, type Piece } from '@/lib/jigsaw/types';

function makePieces(): Piece[] {
  return Array.from({ length: EXPECTED_PIECE_COUNT }, (_, i) => ({
    id: `piece-${i}`,
    correctIndex: i,
    imageUrl: null,
  }));
}

// With Math.random mocked to always return 0, shuffleArray's Fisher-Yates produces this
// fixed permutation of correctIndex values (verified against lib/game/shuffle.test.ts's
// documented behavior for the same mock).
const SHUFFLED_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];

describe('PuzzleGame', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('places a selected piece on its correct slot and removes it from the tray', async () => {
    const user = userEvent.setup();
    render(<PuzzleGame pieces={makePieces()} />);

    const firstPieceIndex = SHUFFLED_ORDER[0];
    await user.click(screen.getByTestId(`puzzle-piece-piece-${firstPieceIndex}`));
    await user.click(screen.getByTestId(`puzzle-slot-${firstPieceIndex}`));

    const slot = screen.getByTestId(`puzzle-slot-${firstPieceIndex}`);
    expect(within(slot).getByTestId(`puzzle-piece-piece-${firstPieceIndex}`)).toBeInTheDocument();
  });

  it('does not place a piece on the wrong slot', async () => {
    const user = userEvent.setup();
    render(<PuzzleGame pieces={makePieces()} />);

    const firstPieceIndex = SHUFFLED_ORDER[0];
    const wrongSlot = (firstPieceIndex + 1) % EXPECTED_PIECE_COUNT;
    await user.click(screen.getByTestId(`puzzle-piece-piece-${firstPieceIndex}`));
    await user.click(screen.getByTestId(`puzzle-slot-${wrongSlot}`));

    const slot = screen.getByTestId(`puzzle-slot-${wrongSlot}`);
    expect(within(slot).queryByTestId(`puzzle-piece-piece-${firstPieceIndex}`)).toBeNull();
  });

  it('shows the result modal once every piece has been placed correctly', async () => {
    const user = userEvent.setup();
    render(<PuzzleGame pieces={makePieces()} />);

    for (const pieceIndex of SHUFFLED_ORDER) {
      await user.click(screen.getByTestId(`puzzle-piece-piece-${pieceIndex}`));
      await user.click(screen.getByTestId(`puzzle-slot-${pieceIndex}`));
    }

    expect(await screen.findByText('¡Completaste el rompecabezas!')).toBeInTheDocument();
  });

  it('restarts and clears the board when "Reiniciar" is clicked', async () => {
    const user = userEvent.setup();
    render(<PuzzleGame pieces={makePieces()} />);

    const firstPieceIndex = SHUFFLED_ORDER[0];
    await user.click(screen.getByTestId(`puzzle-piece-piece-${firstPieceIndex}`));
    await user.click(screen.getByTestId(`puzzle-slot-${firstPieceIndex}`));
    expect(
      within(screen.getByTestId(`puzzle-slot-${firstPieceIndex}`)).getByTestId(
        `puzzle-piece-piece-${firstPieceIndex}`,
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reiniciar' }));

    const resetSlot = screen.getByTestId(`puzzle-slot-${firstPieceIndex}`);
    expect(resetSlot.tagName).toBe('BUTTON');
    expect(within(resetSlot).queryByTestId(`puzzle-piece-piece-${firstPieceIndex}`)).toBeNull();
  });
});
