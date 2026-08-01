import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryCard } from './MemoryCard';
import type { MemoryCardData } from '@/lib/game/types';

function makeCard(overrides: Partial<MemoryCardData> = {}): MemoryCardData {
  return {
    id: 'p1-text',
    pairId: 'p1',
    type: 'text',
    content: 'Biblioteca',
    isFlipped: false,
    isMatched: false,
    ...overrides,
  };
}

describe('MemoryCard', () => {
  it('does not reveal content when face-down', () => {
    render(<MemoryCard card={makeCard()} onClick={vi.fn()} disabled={false} />);
    expect(screen.queryByText('Biblioteca')).not.toBeInTheDocument();
  });

  it('reveals text content when flipped', () => {
    render(<MemoryCard card={makeCard({ isFlipped: true })} onClick={vi.fn()} disabled={false} />);
    expect(screen.getByText('Biblioteca')).toBeInTheDocument();
  });

  it('reveals image content when flipped', () => {
    const { container } = render(
      <MemoryCard
        card={makeCard({ type: 'image', content: 'img.png', isFlipped: true })}
        onClick={vi.fn()}
        disabled={false}
      />
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', expect.stringContaining('img.png'));
  });

  it('calls onClick with the card id when clicked', async () => {
    const onClick = vi.fn();
    render(<MemoryCard card={makeCard()} onClick={onClick} disabled={false} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith('p1-text');
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<MemoryCard card={makeCard()} onClick={onClick} disabled />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when already matched', async () => {
    const onClick = vi.fn();
    render(<MemoryCard card={makeCard({ isMatched: true, isFlipped: true })} onClick={onClick} disabled={false} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
