import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PuzzleBoard } from './PuzzleBoard';
import { EXPECTED_PIECE_COUNT, type Piece } from '@/lib/jigsaw/types';

const piece: Piece = { id: 'piece-0', correctIndex: 0, imageUrl: null };

describe('PuzzleBoard', () => {
  it('renders one slot per expected piece', () => {
    const board = new Array(EXPECTED_PIECE_COUNT).fill(null);
    render(<PuzzleBoard board={board} pieceById={new Map()} lastError={null} onSlotClick={vi.fn()} />);

    for (let i = 0; i < EXPECTED_PIECE_COUNT; i++) {
      expect(screen.getByTestId(`puzzle-slot-${i}`)).toBeInTheDocument();
    }
  });

  it('renders the placed piece inside its slot', () => {
    const board = new Array(EXPECTED_PIECE_COUNT).fill(null);
    board[0] = piece.id;
    render(
      <PuzzleBoard
        board={board}
        pieceById={new Map([[piece.id, piece]])}
        lastError={null}
        onSlotClick={vi.fn()}
      />,
    );

    expect(screen.getByTestId(`puzzle-piece-${piece.id}`)).toBeInTheDocument();
  });

  it('calls onSlotClick with the clicked empty slot index', async () => {
    const user = userEvent.setup();
    const onSlotClick = vi.fn();
    const board = new Array(EXPECTED_PIECE_COUNT).fill(null);
    render(<PuzzleBoard board={board} pieceById={new Map()} lastError={null} onSlotClick={onSlotClick} />);

    await user.click(screen.getByTestId('puzzle-slot-3'));
    expect(onSlotClick).toHaveBeenCalledWith(3);
  });
});
