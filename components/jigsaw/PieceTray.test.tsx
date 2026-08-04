import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PieceTray } from './PieceTray';
import type { Piece } from '@/lib/jigsaw/types';

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `piece-${i}`,
    correctIndex: i,
    imageUrl: null,
  }));
}

describe('PieceTray', () => {
  it('shows only a window of pieces and pages down with the arrow button', async () => {
    const user = userEvent.setup();
    const pieces = makePieces(5);
    render(
      <PieceTray pieces={pieces} selectedPieceId={null} errorPieceId={null} onSelectPiece={vi.fn()} />,
    );

    expect(screen.getByTestId('puzzle-piece-piece-0')).toBeInTheDocument();
    expect(screen.queryByTestId('puzzle-piece-piece-3')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver más piezas' }));

    expect(screen.queryByTestId('puzzle-piece-piece-0')).not.toBeInTheDocument();
    expect(screen.getByTestId('puzzle-piece-piece-1')).toBeInTheDocument();
  });

  it('marks the selected piece and calls onSelectPiece when clicked', async () => {
    const user = userEvent.setup();
    const onSelectPiece = vi.fn();
    const pieces = makePieces(2);
    render(
      <PieceTray
        pieces={pieces}
        selectedPieceId="piece-1"
        errorPieceId={null}
        onSelectPiece={onSelectPiece}
      />,
    );

    expect(screen.getByTestId('puzzle-piece-piece-1')).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByTestId('puzzle-piece-piece-0'));
    expect(onSelectPiece).toHaveBeenCalledWith('piece-0');
  });

  it('shows an empty-tray message when there are no pending pieces', () => {
    render(<PieceTray pieces={[]} selectedPieceId={null} errorPieceId={null} onSelectPiece={vi.fn()} />);
    expect(screen.getByText('¡Sin piezas pendientes!')).toBeInTheDocument();
  });
});
